package data

import (
	"bytes"
	"encoding/json"
	"fmt"
	"go-stock/backend/db"
	"go-stock/backend/logger"
	"go-stock/backend/models"
	"go-stock/backend/util"
	"math"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/coocood/freecache"
	"github.com/duke-git/lancet/v2/convertor"
	"github.com/duke-git/lancet/v2/strutil"
	"github.com/go-resty/resty/v2"
	"github.com/robertkrimen/otto"
	"github.com/samber/lo"
	"github.com/tidwall/gjson"
)

// @Date 2025/4/23 14:54
// @Desc
// -----------------------------------------------------------------------------------
type MarketNewsApi struct {
}

func NewMarketNewsApi() *MarketNewsApi {
	return &MarketNewsApi{}
}

func (m MarketNewsApi) TelegraphList(crawlTimeOut int64) *[]models.Telegraph {
	//https://www.cls.cn/nodeapi/telegraphList
	url := "https://www.cls.cn/nodeapi/telegraphList"
	res := map[string]any{}
	_, _ = resty.New().SetTimeout(time.Duration(crawlTimeOut)*time.Second).R().
		SetHeader("Referer", "https://www.cls.cn/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		SetResult(&res).
		Get(url)
	var telegraphs []models.Telegraph

	if v, _ := convertor.ToInt(res["error"]); v == 0 {
		if res["data"] == nil {
			return m.GetNewTelegraph(30)
		}
		data := res["data"].(map[string]any)
		rollData := data["roll_data"].([]any)
		for _, v := range rollData {
			news := v.(map[string]any)
			ctime, _ := convertor.ToInt(news["ctime"])
			dataTime := time.Unix(ctime, 0).Local()
			telegraph := models.Telegraph{
				Title:           news["title"].(string),
				Content:         news["content"].(string),
				Time:            dataTime.Format("15:04:05"),
				DataTime:        &dataTime,
				Url:             news["shareurl"].(string),
				Source:          "财联社电报",
				IsRed:           (news["level"].(string)) != "C",
				SentimentResult: AnalyzeSentiment(news["content"].(string)).Description,
			}
			cnt := int64(0)
			if telegraph.Title == "" {
				db.Dao.Model(telegraph).Where("content=?", telegraph.Content).Count(&cnt)
			} else {
				db.Dao.Model(telegraph).Where("title=?", telegraph.Title).Count(&cnt)
			}
			if cnt > 0 {
				continue
			}
			telegraphs = append(telegraphs, telegraph)
			db.Dao.Model(&models.Telegraph{}).Create(&telegraph)
			logger.SugaredLogger.Debugf("telegraph: %+v", &telegraph)
			if news["subjects"] == nil {
				continue
			}
			subjects := news["subjects"].([]any)
			for _, subject := range subjects {
				name := subject.(map[string]any)["subject_name"].(string)
				tag := &models.Tags{
					Name: name,
					Type: "subject",
				}
				db.Dao.Model(tag).Where("name=? and type=?", name, "subject").FirstOrCreate(&tag)
				db.Dao.Model(models.TelegraphTags{}).Where("telegraph_id=? and tag_id=?", telegraph.ID, tag.ID).FirstOrCreate(&models.TelegraphTags{
					TelegraphId: telegraph.ID,
					TagId:       tag.ID,
				})
			}

		}
		//db.Dao.Model(&models.Telegraph{}).Create(&telegraphs)
		//logger.SugaredLogger.Debugf("telegraphs: %+v", &telegraphs)
	}

	return &telegraphs
}

func (m MarketNewsApi) GetNewTelegraph(crawlTimeOut int64) *[]models.Telegraph {
	url := "https://www.cls.cn/telegraph"
	response, _ := resty.New().SetTimeout(time.Duration(crawlTimeOut)*time.Second).R().
		SetHeader("Referer", "https://www.cls.cn/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		Get(url)
	var telegraphs []models.Telegraph
	//logger.SugaredLogger.Info(string(response.Body()))
	document, _ := goquery.NewDocumentFromReader(strings.NewReader(string(response.Body())))

	document.Find(".telegraph-content-box").Each(func(i int, selection *goquery.Selection) {
		//logger.SugaredLogger.Info(selection.Text())
		telegraph := models.Telegraph{Source: "财联社电报"}
		spans := selection.Find("div.telegraph-content-box span")
		if spans.Length() == 2 {
			telegraph.Time = spans.First().Text()
			telegraph.Content = spans.Last().Text()
			if spans.Last().HasClass("c-de0422") {
				telegraph.IsRed = true
			}
		}

		labels := selection.Find("div a.label-item")
		labels.Each(func(i int, selection *goquery.Selection) {
			if selection.HasClass("link-label-item") {
				telegraph.Url = selection.AttrOr("href", "")
			} else {
				tag := &models.Tags{
					Name: selection.Text(),
					Type: "subject",
				}
				db.Dao.Model(tag).Where("name=? and type=?", selection.Text(), "subject").FirstOrCreate(&tag)
				telegraph.SubjectTags = append(telegraph.SubjectTags, selection.Text())
			}
		})
		stocks := selection.Find("div.telegraph-stock-plate-box a")
		stocks.Each(func(i int, selection *goquery.Selection) {
			telegraph.StocksTags = append(telegraph.StocksTags, selection.Text())
		})

		//telegraph = append(telegraph, ReplaceSensitiveWords(selection.Text()))
		if telegraph.Content != "" {
			telegraph.SentimentResult = AnalyzeSentiment(telegraph.Content).Description
			cnt := int64(0)
			db.Dao.Model(telegraph).Where("time=? and content=?", telegraph.Time, telegraph.Content).Count(&cnt)
			if cnt == 0 {
				db.Dao.Create(&telegraph)
				telegraphs = append(telegraphs, telegraph)
				for _, tag := range telegraph.SubjectTags {
					tagInfo := &models.Tags{}
					db.Dao.Model(models.Tags{}).Where("name=? and type=?", tag, "subject").First(&tagInfo)
					if tagInfo.ID > 0 {
						db.Dao.Model(models.TelegraphTags{}).Where("telegraph_id=? and tag_id=?", telegraph.ID, tagInfo.ID).FirstOrCreate(&models.TelegraphTags{
							TelegraphId: telegraph.ID,
							TagId:       tagInfo.ID,
						})
					}
				}
			}

		}
	})
	return &telegraphs
}
func (m MarketNewsApi) GetNewsList(source string, limit int) *[]*models.Telegraph {
	news := &[]*models.Telegraph{}
	if source != "" {
		db.Dao.Model(news).Preload("TelegraphTags").Where("source=?", source).Order("data_time desc,time desc").Limit(limit).Find(news)
	} else {
		db.Dao.Model(news).Preload("TelegraphTags").Order("data_time desc,time desc").Limit(limit).Find(news)
	}
	for _, item := range *news {
		tags := &[]models.Tags{}
		db.Dao.Model(&models.Tags{}).Where("id in ?", lo.Map(item.TelegraphTags, func(item models.TelegraphTags, index int) uint {
			return item.TagId
		})).Find(&tags)
		tagNames := lo.Map(*tags, func(item models.Tags, index int) string {
			return item.Name
		})
		item.SubjectTags = tagNames
		logger.SugaredLogger.Infof("tagNames %v ，SubjectTags：%s", tagNames, item.SubjectTags)
	}
	return news
}
func (m MarketNewsApi) GetNewsList2(source string, limit int) *[]*models.Telegraph {
	NewMarketNewsApi().TelegraphList(30)
	news := &[]*models.Telegraph{}
	if source != "" {
		db.Dao.Model(news).Preload("TelegraphTags").Where("source=?", source).Order("data_time desc,is_red desc").Limit(limit).Find(news)
	} else {
		db.Dao.Model(news).Preload("TelegraphTags").Order("data_time desc,is_red desc").Limit(limit).Find(news)
	}
	for _, item := range *news {
		tags := &[]models.Tags{}
		db.Dao.Model(&models.Tags{}).Where("id in ?", lo.Map(item.TelegraphTags, func(item models.TelegraphTags, index int) uint {
			return item.TagId
		})).Find(&tags)
		tagNames := lo.Map(*tags, func(item models.Tags, index int) string {
			return item.Name
		})
		item.SubjectTags = tagNames
		logger.SugaredLogger.Infof("tagNames %v ，SubjectTags：%s", tagNames, item.SubjectTags)
	}
	return news
}

func (m MarketNewsApi) GetTelegraphList(source string) *[]*models.Telegraph {
	news := &[]*models.Telegraph{}
	if source != "" {
		db.Dao.Model(news).Preload("TelegraphTags").Where("source=?", source).Order("data_time desc,time desc").Limit(50).Find(news)
	} else {
		db.Dao.Model(news).Preload("TelegraphTags").Order("data_time desc,time desc").Limit(50).Find(news)
	}
	for _, item := range *news {
		tags := &[]models.Tags{}
		db.Dao.Model(&models.Tags{}).Where("id in ?", lo.Map(item.TelegraphTags, func(item models.TelegraphTags, index int) uint {
			return item.TagId
		})).Find(&tags)
		tagNames := lo.Map(*tags, func(item models.Tags, index int) string {
			return item.Name
		})
		item.SubjectTags = tagNames
		logger.SugaredLogger.Infof("tagNames %v ，SubjectTags：%s", tagNames, item.SubjectTags)
	}
	return news
}
func (m MarketNewsApi) GetTelegraphListWithPaging(source string, page, pageSize int) *[]*models.Telegraph {
	// 计算偏移量
	offset := (page - 1) * pageSize

	news := &[]*models.Telegraph{}
	if source != "" {
		db.Dao.Model(news).Preload("TelegraphTags").Where("source=?", source).Order("data_time desc,time desc").Limit(pageSize).Offset(offset).Find(news)
	} else {
		db.Dao.Model(news).Preload("TelegraphTags").Order("data_time desc,time desc").Limit(pageSize).Offset(offset).Find(news)
	}
	for _, item := range *news {
		tags := &[]models.Tags{}
		db.Dao.Model(&models.Tags{}).Where("id in ?", lo.Map(item.TelegraphTags, func(item models.TelegraphTags, index int) uint {
			return item.TagId
		})).Find(&tags)
		tagNames := lo.Map(*tags, func(item models.Tags, index int) string {
			return item.Name
		})
		item.SubjectTags = tagNames
		logger.SugaredLogger.Infof("tagNames %v ，SubjectTags：%s", tagNames, item.SubjectTags)
	}
	return news
}

func (m MarketNewsApi) GetSinaNews(crawlTimeOut uint) *[]models.Telegraph {
	news := &[]models.Telegraph{}
	response, _ := resty.New().SetTimeout(time.Duration(crawlTimeOut)*time.Second).R().
		SetHeader("Referer", "https://finance.sina.com.cn").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		Get("https://zhibo.sina.com.cn/api/zhibo/feed?callback=callback&page=1&page_size=20&zhibo_id=152&tag_id=0&dire=f&dpc=1&pagesize=20&id=4161089&type=0&_=" + strconv.FormatInt(time.Now().Unix(), 10))
	js := string(response.Body())
	js = strutil.ReplaceWithMap(js, map[string]string{
		"try{callback(":  "var data=",
		");}catch(e){};": ";",
	})
	//logger.SugaredLogger.Info(js)
	vm := otto.New()
	_, err := vm.Run(js)
	if err != nil {
		logger.SugaredLogger.Error(err)
	}
	vm.Run("var result = data.result;")
	//vm.Run("var resultStr =JSON.stringify(data);")
	vm.Run("var resultData = result.data;")
	vm.Run("var feed = resultData.feed;")
	vm.Run("var feedStr = JSON.stringify(feed);")

	value, _ := vm.Get("feedStr")
	//resultStr, _ := vm.Get("resultStr")

	//logger.SugaredLogger.Info(resultStr)
	feed := make(map[string]any)
	err = json.Unmarshal([]byte(value.String()), &feed)
	if err != nil {
		logger.SugaredLogger.Errorf("json.Unmarshal error:%v", err.Error())
	}
	var telegraphs []models.Telegraph

	if feed["list"] != nil {
		for _, item := range feed["list"].([]any) {
			telegraph := models.Telegraph{Source: "新浪财经"}
			data := item.(map[string]any)
			//logger.SugaredLogger.Infof("%s:%s", data["create_time"], data["rich_text"])
			telegraph.Content = data["rich_text"].(string)
			telegraph.Title = strutil.SubInBetween(data["rich_text"].(string), "【", "】")
			telegraph.Time = strings.Split(data["create_time"].(string), " ")[1]
			dataTime, _ := time.ParseInLocation("2006-01-02 15:04:05", data["create_time"].(string), time.Local)
			if &dataTime != nil {
				telegraph.DataTime = &dataTime
			}
			tags := data["tag"].([]any)
			telegraph.SubjectTags = lo.Map(tags, func(tagItem any, index int) string {
				name := tagItem.(map[string]any)["name"].(string)
				tag := &models.Tags{
					Name: name,
					Type: "sina_subject",
				}
				db.Dao.Model(tag).Where("name=? and type=?", name, "sina_subject").FirstOrCreate(&tag)
				return name
			})
			if _, ok := lo.Find(telegraph.SubjectTags, func(item string) bool { return item == "焦点" }); ok {
				telegraph.IsRed = true
			}
			logger.SugaredLogger.Infof("telegraph.SubjectTags:%v %s", telegraph.SubjectTags, telegraph.Content)

			if telegraph.Content != "" {
				telegraph.SentimentResult = AnalyzeSentiment(telegraph.Content).Description
				cnt := int64(0)
				if telegraph.Title == "" {
					db.Dao.Model(telegraph).Where("content=?", telegraph.Content).Count(&cnt)
				} else {
					db.Dao.Model(telegraph).Where("title=?", telegraph.Title).Count(&cnt)
				}
				if cnt == 0 {
					db.Dao.Create(&telegraph)
					telegraphs = append(telegraphs, telegraph)
					for _, tag := range telegraph.SubjectTags {
						tagInfo := &models.Tags{}
						db.Dao.Model(models.Tags{}).Where("name=? and type=?", tag, "sina_subject").First(&tagInfo)
						if tagInfo.ID > 0 {
							db.Dao.Model(models.TelegraphTags{}).Where("telegraph_id=? and tag_id=?", telegraph.ID, tagInfo.ID).FirstOrCreate(&models.TelegraphTags{
								TelegraphId: telegraph.ID,
								TagId:       tagInfo.ID,
							})
						}
					}
				}
			}
		}
		return &telegraphs
	}

	return news

}

func (m MarketNewsApi) GlobalStockIndexes(crawlTimeOut uint) map[string]any {
	response, _ := resty.New().SetTimeout(time.Duration(crawlTimeOut)*time.Second).R().
		SetHeader("Referer", "https://stockapp.finance.qq.com/mstats").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		Get("https://proxy.finance.qq.com/ifzqgtimg/appstock/app/rank/indexRankDetail2")
	js := string(response.Body())
	res := make(map[string]any)
	json.Unmarshal([]byte(js), &res)
	return res["data"].(map[string]any)
}

func (m MarketNewsApi) GetIndustryRank(sort string, cnt int) map[string]any {

	url := fmt.Sprintf("https://proxy.finance.qq.com/ifzqgtimg/appstock/app/mktHs/rank?l=%d&p=1&t=01/averatio&ordertype=&o=%s", cnt, sort)
	response, _ := resty.New().SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Referer", "https://stockapp.finance.qq.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		Get(url)
	js := string(response.Body())
	res := make(map[string]any)
	json.Unmarshal([]byte(js), &res)
	return res
}

func (m MarketNewsApi) GetIndustryMoneyRankSina(fenlei, sort string) []map[string]any {
	url := fmt.Sprintf("https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_bkzj_bk?page=1&num=20&sort=%s&asc=0&fenlei=%s", sort, fenlei)

	response, _ := resty.New().SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Host", "vip.stock.finance.sina.com.cn").
		SetHeader("Referer", "https://finance.sina.com.cn").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		Get(url)
	js := string(response.Body())
	res := &[]map[string]any{}
	err := json.Unmarshal([]byte(js), &res)
	if err != nil {
		logger.SugaredLogger.Error(err)
		return *res
	}
	return *res
}

func (m MarketNewsApi) GetMoneyRankSina(sort string) []map[string]any {
	if sort == "" {
		sort = "netamount"
	}
	url := fmt.Sprintf("https://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_bkzj_ssggzj?page=1&num=20&sort=%s&asc=0&bankuai=&shichang=", sort)
	response, _ := resty.New().SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Host", "vip.stock.finance.sina.com.cn").
		SetHeader("Referer", "https://finance.sina.com.cn").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		Get(url)
	js := string(response.Body())
	res := &[]map[string]any{}
	err := json.Unmarshal([]byte(js), &res)
	if err != nil {
		logger.SugaredLogger.Error(err)
		return *res
	}
	return *res
}

func (m MarketNewsApi) GetStockMoneyTrendByDay(stockCode string, days int) []map[string]any {
	url := fmt.Sprintf("http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/MoneyFlow.ssl_qsfx_zjlrqs?page=1&num=%d&sort=opendate&asc=0&daima=%s", days, stockCode)

	response, _ := resty.New().SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Host", "vip.stock.finance.sina.com.cn").
		SetHeader("Referer", "https://finance.sina.com.cn").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").Get(url)
	js := string(response.Body())
	res := &[]map[string]any{}
	err := json.Unmarshal([]byte(js), &res)
	if err != nil {
		logger.SugaredLogger.Error(err)
		return *res
	}
	return *res

}

func (m MarketNewsApi) TopStocksRankingList(date string) {
	url := fmt.Sprintf("http://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/lhb/index.phtml?tradedate=%s", date)
	response, _ := resty.New().SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Host", "vip.stock.finance.sina.com.cn").
		SetHeader("Referer", "https://finance.sina.com.cn").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").Get(url)

	html, _ := convertor.GbkToUtf8(response.Body())
	//logger.SugaredLogger.Infof("html:%s", html)
	document, err := goquery.NewDocumentFromReader(bytes.NewReader(html))
	if err != nil {
		return
	}
	document.Find("table.list_table").Each(func(i int, s *goquery.Selection) {
		title := strutil.Trim(s.Find("tr:first-child").First().Text())
		logger.SugaredLogger.Infof("title:%s", title)
		s.Find("tr:not(:first-child)").Each(func(i int, s *goquery.Selection) {
			logger.SugaredLogger.Infof("s:%s", strutil.RemoveNonPrintable(s.Text()))
		})
	})

}

func (m MarketNewsApi) LongTiger(date string) *[]models.LongTigerRankData {
	ranks := &[]models.LongTigerRankData{}
	url := "https://datacenter-web.eastmoney.com/api/data/v1/get"
	logger.SugaredLogger.Infof("url:%s", url)
	params := make(map[string]string)
	params["callback"] = "callback"
	params["sortColumns"] = "TURNOVERRATE,TRADE_DATE,SECURITY_CODE"
	params["sortTypes"] = "-1,-1,1"
	params["pageSize"] = "500"
	params["pageNumber"] = "1"
	params["reportName"] = "RPT_DAILYBILLBOARD_DETAILSNEW"
	params["columns"] = "SECURITY_CODE,SECUCODE,SECURITY_NAME_ABBR,TRADE_DATE,EXPLAIN,CLOSE_PRICE,CHANGE_RATE,BILLBOARD_NET_AMT,BILLBOARD_BUY_AMT,BILLBOARD_SELL_AMT,BILLBOARD_DEAL_AMT,ACCUM_AMOUNT,DEAL_NET_RATIO,DEAL_AMOUNT_RATIO,TURNOVERRATE,FREE_MARKET_CAP,EXPLANATION,D1_CLOSE_ADJCHRATE,D2_CLOSE_ADJCHRATE,D5_CLOSE_ADJCHRATE,D10_CLOSE_ADJCHRATE,SECURITY_TYPE_CODE"
	params["source"] = "WEB"
	params["client"] = "WEB"
	params["filter"] = fmt.Sprintf("(TRADE_DATE<='%s')(TRADE_DATE>='%s')", date, date)
	resp, err := resty.New().SetTimeout(time.Duration(15)*time.Second).R().
		SetHeader("Host", "datacenter-web.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/stock/tradedetail.html").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetQueryParams(params).
		Get(url)
	if err != nil {
		return ranks
	}
	js := string(resp.Body())
	logger.SugaredLogger.Infof("resp:%s", js)

	js = strutil.ReplaceWithMap(js, map[string]string{
		"callback(": "var data=",
		");":        ";",
	})
	//logger.SugaredLogger.Info(js)
	vm := otto.New()
	_, err = vm.Run(js)
	_, err = vm.Run("var data = JSON.stringify(data);")
	value, err := vm.Get("data")
	logger.SugaredLogger.Infof("resp-json:%s", value.String())
	data := gjson.Get(value.String(), "result.data")
	logger.SugaredLogger.Infof("resp:%v", data)
	err = json.Unmarshal([]byte(data.String()), ranks)
	if err != nil {
		logger.SugaredLogger.Error(err)
		return ranks
	}
	for _, rankData := range *ranks {
		temp := &models.LongTigerRankData{}
		db.Dao.Model(temp).Where(&models.LongTigerRankData{
			TRADEDATE: rankData.TRADEDATE,
			SECUCODE:  rankData.SECUCODE,
		}).First(temp)
		if temp.SECURITYTYPECODE == "" {
			db.Dao.Model(temp).Create(&rankData)
		}
	}
	return ranks
}

func (m MarketNewsApi) IndustryResearchReport(industryCode string, days int) []any {
	beginDate := time.Now().Add(-time.Duration(days) * 24 * time.Hour).Format("2006-01-02")
	endDate := time.Now().Format("2006-01-02")
	if strutil.Trim(industryCode) != "" {
		beginDate = time.Now().Add(-time.Duration(days) * 365 * time.Hour).Format("2006-01-02")
	}

	logger.SugaredLogger.Infof("IndustryResearchReport-name:%s", industryCode)
	params := map[string]string{
		"industry":     "*",
		"industryCode": industryCode,
		"beginTime":    beginDate,
		"endTime":      endDate,
		"pageNo":       "1",
		"pageSize":     "50",
		"p":            "1",
		"pageNum":      "1",
		"pageNumber":   "1",
		"qType":        "1",
	}

	url := "https://reportapi.eastmoney.com/report/list"

	logger.SugaredLogger.Infof("beginDate:%s endDate:%s", beginDate, endDate)
	resp, err := resty.New().SetTimeout(time.Duration(15)*time.Second).R().
		SetHeader("Host", "reportapi.eastmoney.com").
		SetHeader("Origin", "https://data.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/report/stock.jshtml").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetHeader("Content-Type", "application/json").
		SetQueryParams(params).Get(url)
	respMap := map[string]any{}

	if err != nil {
		return []any{}
	}
	json.Unmarshal(resp.Body(), &respMap)
	//logger.SugaredLogger.Infof("resp:%+v", respMap["data"])
	return respMap["data"].([]any)
}
func (m MarketNewsApi) StockResearchReport(stockCode string, days int) []any {
	beginDate := time.Now().Add(-time.Duration(days) * 24 * time.Hour).Format("2006-01-02")
	endDate := time.Now().Format("2006-01-02")
	if strutil.ContainsAny(stockCode, []string{"."}) {
		stockCode = strings.Split(stockCode, ".")[0]
		beginDate = time.Now().Add(-time.Duration(days) * 365 * time.Hour).Format("2006-01-02")
	} else {
		stockCode = strutil.ReplaceWithMap(stockCode, map[string]string{
			"sh":  "",
			"sz":  "",
			"gb_": "",
			"us":  "",
			"us_": "",
		})
		beginDate = time.Now().Add(-time.Duration(days) * 365 * time.Hour).Format("2006-01-02")
	}

	logger.SugaredLogger.Infof("StockResearchReport-stockCode:%s", stockCode)

	type Req struct {
		BeginTime    string      `json:"beginTime"`
		EndTime      string      `json:"endTime"`
		IndustryCode string      `json:"industryCode"`
		RatingChange string      `json:"ratingChange"`
		Rating       string      `json:"rating"`
		OrgCode      interface{} `json:"orgCode"`
		Code         string      `json:"code"`
		Rcode        string      `json:"rcode"`
		PageSize     int         `json:"pageSize"`
		PageNo       int         `json:"pageNo"`
		P            int         `json:"p"`
		PageNum      int         `json:"pageNum"`
		PageNumber   int         `json:"pageNumber"`
	}

	url := "https://reportapi.eastmoney.com/report/list2"

	logger.SugaredLogger.Infof("beginDate:%s endDate:%s", beginDate, endDate)
	resp, err := resty.New().SetTimeout(time.Duration(15)*time.Second).R().
		SetHeader("Host", "reportapi.eastmoney.com").
		SetHeader("Origin", "https://data.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/report/stock.jshtml").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetHeader("Content-Type", "application/json").
		SetBody(&Req{
			Code:         stockCode,
			IndustryCode: "*",
			BeginTime:    beginDate,
			EndTime:      endDate,
			PageNo:       1,
			PageSize:     50,
			P:            1,
			PageNum:      1,
			PageNumber:   1,
		}).Post(url)
	respMap := map[string]any{}

	if err != nil {
		return []any{}
	}
	json.Unmarshal(resp.Body(), &respMap)
	//logger.SugaredLogger.Infof("resp:%+v", respMap["data"])
	return respMap["data"].([]any)
}

func (m MarketNewsApi) StockNotice(stock_list string) []any {
	var stockCodes []string
	for _, stockCode := range strings.Split(stock_list, ",") {
		if strutil.ContainsAny(stockCode, []string{"."}) {
			stockCode = strings.Split(stockCode, ".")[0]
			stockCodes = append(stockCodes, stockCode)
		} else {
			stockCode = strutil.ReplaceWithMap(stockCode, map[string]string{
				"sh":  "",
				"sz":  "",
				"gb_": "",
				"us":  "",
				"us_": "",
			})
			stockCodes = append(stockCodes, stockCode)
		}
	}

	url := "https://np-anotice-stock.eastmoney.com/api/security/ann?page_size=50&page_index=1&ann_type=SHA%2CCYB%2CSZA%2CBJA%2CINV&client_source=web&f_node=0&stock_list=" + strings.Join(stockCodes, ",")
	resp, err := resty.New().SetTimeout(time.Duration(15)*time.Second).R().
		SetHeader("Host", "np-anotice-stock.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/notices/hsa/5.html").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	respMap := map[string]any{}

	if err != nil {
		return []any{}
	}
	json.Unmarshal(resp.Body(), &respMap)
	//logger.SugaredLogger.Infof("resp:%+v", respMap["data"])
	return (respMap["data"].(map[string]any))["list"].([]any)
}

func (m MarketNewsApi) EMDictCode(code string, cache *freecache.Cache) []any {
	respMap := map[string]any{}

	d, _ := cache.Get([]byte(code))
	if d != nil {
		json.Unmarshal(d, &respMap)
		return respMap["data"].([]any)
	}

	url := "https://reportapi.eastmoney.com/report/bk"

	params := map[string]string{
		"bkCode": code,
	}
	resp, err := resty.New().SetTimeout(time.Duration(15)*time.Second).R().
		SetHeader("Host", "reportapi.eastmoney.com").
		SetHeader("Origin", "https://data.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/report/industry.jshtml").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetHeader("Content-Type", "application/json").
		SetQueryParams(params).Get(url)

	if err != nil {
		return []any{}
	}
	json.Unmarshal(resp.Body(), &respMap)
	//logger.SugaredLogger.Infof("resp:%+v", respMap["data"])
	cache.Set([]byte(code), resp.Body(), 60*60*24)
	return respMap["data"].([]any)
}

func (m MarketNewsApi) TradingViewNews() *[]models.Telegraph {
	client := resty.New()
	config := GetSettingConfig()
	if config.HttpProxyEnabled && config.HttpProxy != "" {
		client.SetProxy(config.HttpProxy)
	}
	TVNews := &[]models.TVNews{}
	news := &[]models.Telegraph{}
	//	url := "https://news-mediator.tradingview.com/news-flow/v2/news?filter=lang:zh-Hans&filter=area:WLD&client=screener&streaming=false"
	//url := "https://news-mediator.tradingview.com/news-flow/v2/news?filter=area%3AWLD&filter=lang%3Azh-Hans&client=screener&streaming=false"
	url := "https://news-mediator.tradingview.com/news-flow/v2/news?filter=lang%3Azh-Hans&client=screener&streaming=false"

	resp, err := client.SetTimeout(time.Duration(15)*time.Second).R().
		SetHeader("Host", "news-mediator.tradingview.com").
		SetHeader("Origin", "https://cn.tradingview.com").
		SetHeader("Referer", "https://cn.tradingview.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("TradingViewNews err:%s", err.Error())
		return news
	}
	respMap := map[string]any{}
	err = json.Unmarshal(resp.Body(), &respMap)
	if err != nil {
		return news
	}
	items, err := json.Marshal(respMap["items"])
	if err != nil {
		return news
	}
	json.Unmarshal(items, TVNews)

	for i, a := range *TVNews {
		if i > 10 {
			break
		}
		detail := NewMarketNewsApi().TradingViewNewsDetail(a.Id)
		dataTime := time.Unix(int64(a.Published), 0).Local()
		description := ""
		sentimentResult := ""
		if detail != nil {
			description = detail.ShortDescription
			sentimentResult = AnalyzeSentiment(description).Description
		}
		if a.Title == "" {
			continue
		}
		telegraph := &models.Telegraph{
			Title:           a.Title,
			Content:         description,
			DataTime:        &dataTime,
			IsRed:           false,
			Time:            dataTime.Format("15:04:05"),
			Source:          "外媒",
			Url:             fmt.Sprintf("https://cn.tradingview.com/news/%s", a.Id),
			SentimentResult: sentimentResult,
		}
		cnt := int64(0)
		if telegraph.Title == "" {
			db.Dao.Model(telegraph).Where("content=?", telegraph.Content).Count(&cnt)
		} else {
			db.Dao.Model(telegraph).Where("title=?", telegraph.Title).Count(&cnt)
		}
		if cnt > 0 {
			continue
		}
		db.Dao.Model(&models.Telegraph{}).Where("time=? and title=? and source=?", telegraph.Time, telegraph.Title, "外媒").FirstOrCreate(&telegraph)
		*news = append(*news, *telegraph)
	}
	return news
}
func (m MarketNewsApi) TradingViewNewsDetail(id string) *models.TVNewsDetail {
	//https://news-headlines.tradingview.com/v3/story?id=panews%3A9be7cf057e3f9%3A0&lang=zh-Hans
	newsDetail := &models.TVNewsDetail{}
	newsUrl := fmt.Sprintf("https://news-headlines.tradingview.com/v3/story?id=%s&lang=zh-Hans", url.QueryEscape(id))

	client := resty.New()
	config := GetSettingConfig()
	if config.HttpProxyEnabled && config.HttpProxy != "" {
		client.SetProxy(config.HttpProxy)
	}
	request := client.SetTimeout(time.Duration(3) * time.Second).R()
	_, err := request.
		SetHeader("Host", "news-headlines.tradingview.com").
		SetHeader("Origin", "https://cn.tradingview.com").
		SetHeader("Referer", "https://cn.tradingview.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0").
		//SetHeader("TE", "trailers").
		//SetHeader("Priority", "u=4").
		//SetHeader("Connection", "keep-alive").
		SetResult(newsDetail).
		Get(newsUrl)
	if err != nil {
		logger.SugaredLogger.Errorf("TradingViewNewsDetail err:%s", err.Error())
		return newsDetail
	}
	logger.SugaredLogger.Infof("resp:%+v", newsDetail)
	return newsDetail
}

func (m MarketNewsApi) XUEQIUHotStock(size int, marketType string) *[]models.HotItem {
	request := resty.New().SetTimeout(time.Duration(30) * time.Second).R()
	_, err := request.
		SetHeader("Host", "xueqiu.com").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get("https://xueqiu.com/hq#hot")

	//cookies := resp.Header().Get("Set-Cookie")
	//logger.SugaredLogger.Infof("cookies:%s", cookies)

	url := fmt.Sprintf("https://stock.xueqiu.com/v5/stock/hot_stock/list.json?page=1&size=%d&_type=%s&type=%s", size, marketType, marketType)
	res := &models.XUEQIUHot{}
	_, err = request.
		SetHeader("Host", "stock.xueqiu.com").
		SetHeader("Origin", "https://xueqiu.com").
		SetHeader("Referer", "https://xueqiu.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		//SetHeader("Cookie", "cookiesu=871730774144180; device_id=ee75cebba8a35005c9e7baf7b7dead59; s=ch12b12pfi; Hm_lvt_1db88642e346389874251b5a1eded6e3=1746247619; xq_a_token=361dcfccb1d32a1d9b5b65f1a188b9c9ed1e687d; xqat=361dcfccb1d32a1d9b5b65f1a188b9c9ed1e687d; xq_r_token=450d1db0db9659a6af7cc9297bfa4fccf1776fae; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOi0xLCJpc3MiOiJ1YyIsImV4cCI6MTc1MzgzODAwNiwiY3RtIjoxNzUxMjUxMzc2MDY3LCJjaWQiOiJkOWQwbjRBWnVwIn0.TjEtQ5WEN4ajnVjVnY3J-Qq9LjL-F0eat9Cefv_tLJLqsPhzD2y8Lc1CeIu0Ceqhlad7O_yW1tR9nb2dIjDpyOPzWKxvwSOKXLm8XMoz4LMgE2pysBCH4TsetzHsEOhBsY467q-JX3WoFuqo-dqv1FfLSondZCspjEMFdgPFt2V-2iXJY05YUwcBVUvL74mT9ZjNq0KaDeRBJk_il6UR8yibG7RMbe9xWYz5dSO_wJwWuxvnZ8u9EXC2m-TV7-QHVxFHR_5e8Fodrzg0yIcLU4wBTSoIIQDUKqngajX2W-nUAdo6fr78NNDmoswFVH7T7XMuQciMAqj9MpMCVW3Sog; u=871730774144180; ssxmod_itna=iq+h7KAImDORKYQ4Y5G=nxBKDtD7D3qCD0dGMDxeq7tDRDFqApKDHtA68oon7ziBA0+PbZ9xGN4oYxiNDAPq0iDC+Wjxs9Orw5KQb9iqP4MAn0TbNsbtU22eqbCe=S3vTv6xoDHxY=DU1GzeieDx=PD5xDTDWeDGDD3DmnsDi5YD0KDjBYpH+omDYPDEBYDaxDbDimwY4GCrDDCtc5Dw6bmzDDzznL5WWAPzWffZg3YcFgxf8GwD7y3Dla4rMhw23=cz0Efdk0A5hYDXotDvhoY1/H6neEvOt3o=Q0ruT+5RuxoRhDxCmh5tGP32xBD5G0xS2xcb4quDK0Dy2ZmY/DDWM0qmEeSEDeOCIq1fw1misCY=WAzoOtMwDzGdUjpRk5Z0xQBDI2IMw4H7qNiNBLxWiDD; ssxmod_itna2=iq+h7KAImDORKYQ4Y5G=nxBKDtD7D3qCD0dGMDxeq7tDRDFqApKDHtA68oon7ziBA0+PbZYxD3boBmiEPtDFOEPAeFmDDsuGSxf46oGKwGHd8wtUjFe+oV1lxUzutkGly=nCyCjq=UTHxMxFCr1DsFiKPuEpPVO7GrOyk5Aymnc0+11AFND7v16PvwrFQH4I72=3O1OpK7rGw+poWNCxjj=Ka5QDFWAvEzrDFQcIH=GpKpS90FAyIzGcTyck+yhQKaojn96dRqeIh=HkaFrlGnKwzO+a49=F7/c/MejoR3QM20K9IIOymrMN2bsk2TRdKFiaf4O0ut2MauiOER=iQNW2WVgDrkKzD=57r577wEx2hwkqhf8T8BDvkHZRDirC0bNK4O=G3TSkd3wYwq8bst0t9qF/e3M87NYtU2IWYWzqd=BqEfdqGq0R8wxmqLzpeGeuwSTq1OAiB87gDrozjnGkwDKRdrLz8uDjQKVlGhWk8Wd/rXQjx4pG=BNqpW/6TS1wpfxzGf5CrUhtt0j0wC5AUFo2GbX+QXPzD2guxKXrx8lZUQlwWIHyEUz+OLh0eWUkfHfM0YWXlgOejnuUa06rW9y5maDPipGms751hxKcqLq62pQty4iX3QDF6SRQd3tfEBf3CH7r2xe2qq0qdOI5Ge=GezD/Us5Z0xQBwVAZ2N/XvD0HDD").
		SetResult(res).
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("XUEQIUHotStock err:%s", err.Error())
		return &[]models.HotItem{}
	}
	//logger.SugaredLogger.Infof("XUEQIUHotStock:%+v", res)
	return &res.Data.Items
}

func (m MarketNewsApi) HotEvent(size int) *[]models.HotEvent {
	events := &[]models.HotEvent{}
	url := fmt.Sprintf("https://xueqiu.com/hot_event/list.json?count=%d", size)
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "xueqiu.com").
		SetHeader("Origin", "https://xueqiu.com").
		SetHeader("Referer", "https://xueqiu.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetHeader("Cookie", "cookiesu=2617378771242871; s=c2121pp1u71; device_id=237a58584ec58d8e4d4e1040700a644f1; Hm_lvt_1db88642e346389874251b5a1eded6e3=1744100219,1744599115; xq_a_token=b7259d09435458cc3f1a963479abb270a1a016ce; xqat=b7259d09435458cc3f1a963479abb270a1a016ce; xq_r_token=28108bfa1d92ac8a46bbb57722633746218621a3; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOi0xLCJpc3MiOiJ1YyIsImV4cCI6MTc1MjU0MTk4OCwiY3RtIjoxNzUwMjMwNjA2NzI0LCJjaWQiOiJkOWQwbjRBWnVwIn0.kU_fz0luJoE7nr-K4UrNUi5-mAG-vMdXtuC4mUKIppILId4UpF70LB70yunxGiNSw6tPFR3-hyLvztKAHtekCUTm3XjUl5b3tEDP-ZUVqHnWXO_5hoeMI8h-Cfx6ZGlIr5x3icvTPkT0OV5CD5A33-ZDTKhKPf-DhJ_-m7CG5GbX4MseOBeMXuLUQUiYHPKhX1QUc0GTGrCzi8Mki0z49D0LVqCSgbsx3UGfowOOyx85_cXb4OAFvIjwbs2p0o_h-ibIT0ngVkkAyEDetVvlcZ_bkardhseCB7k9BEMgH2z8ihgkVxyy3P0degLmDUruhmqn5uZOCi1pVBDvCv9lBg; u=261737877124287; ssxmod_itna=QuG=D5AKiKDIqCqGKi7G7DgmmPlSDWFqKGHDyx4YK0CDmxjKiddDUQivnb8xpnQcGyGYoYhoqEeDBubrDSxD67DK4GTm+ogiw1o3B=xedQHDgBtN=7/i1K53N+rOjquLMU=kbqYxB3DExGkqj0tPi4DxaPD5xDTDWeDGDD3DnnsDQKDRx0kL0oDIxD1D0bmHUEvh38mDYePLmOmDYPYx94Y8KoDeEgsD7HUl/vIGGEAqjLPFegXLD0HolCqr4DCid1qDm+ECfkjDn9sD0KP8fn+CRoDv=tYr4ibx+o=W+8vstf9mjGe3cXseWdBmoFrmf4DA3bFAxnAxD7vYxADaDoerDGHPoxHF+PKGPtDKmiqQGeB5qbi4eg4KDHKDe3DeG0qeEP9xVUoHDDWMYYM0ICr4FBimBDM7D0x4QOECmhul5QCN/m5/74lGm=7x9Wp7A+i7xQ7wlMD4D; ssxmod_itna2=QuG=D5AKiKDIqCqGKi7G7DgmmPlSDWFqKGHDyx4YK0CDmxjKiddDUQivnb8xpnQcGyGYoYhoqoDirSDhPmGD24GajjDuGE3m7or4DlxOSGewHl6iaus2Q62SRX5CFjCds6ltF9xy6iaUuB262UkhRA8UXST=4/b+y3kGKzlGE8T29FA008ljy9jXXC7f7m7QsK667mlUooWrofk=qGZjxtcUrN1NtuAnne1hj+rQP5UnlFkxf+o7VjmatH7u7bCDlbTt3cz6CH9Fl4vye16W/ellc8I3Q37W7ZwiLGD/zPpZcnd2nsqqo/+zRbKAmz4plzwaDqGUe7f9E+P0IFRKqpRv+buQFHBSpcbwND7Q+9XWmnjI2UwKd98jIS3gPXwxvbx4OuiyH8gZ+OEt7DgE/AY/9W4VxDZrlFWyWnC4y4/I0IpAfaGKpbPmauKbkqawqv93vSf+9HamGe0Dt2PNgT3yiEB4vQP2/DdVpcGBOjFujWoHP32OshLPYI20LRCKddwEGkKqPzPwKPc3X5zuB=w2fUdtwKsAW5kQtsl8clNwjC5uDYrxR0h9xaj0xmD+YuI3GPT7xYTalRImPj2wL2=+91a304xa4bTWtP=dLGARhb/efRi0uktaz8i8C04G0x/ZWUzqRza8GGU=FfRfvb4GZM/q2rVsl0nLvRjGeAKgocLouyXs/uwZu3YxbAx30qCbjG1A533zAxIeIgD=0VAc3ixD").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("HotEvent err:%s", err.Error())
		return events
	}
	//logger.SugaredLogger.Infof("HotEvent:%s", resp.Body())
	respMap := map[string]any{}
	err = json.Unmarshal(resp.Body(), &respMap)
	items, err := json.Marshal(respMap["list"])
	if err != nil {
		return events
	}
	json.Unmarshal(items, events)
	return events

}

func (m MarketNewsApi) HotTopic(size int) []any {
	url := "https://gubatopic.eastmoney.com/interface/GetData.aspx?path=newtopic/api/Topic/HomePageListRead"
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "gubatopic.eastmoney.com").
		SetHeader("Origin", "https://gubatopic.eastmoney.com").
		SetHeader("Referer", "https://gubatopic.eastmoney.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetFormData(map[string]string{
			"param": fmt.Sprintf("ps=%d&p=1&type=0", size),
			"path":  "newtopic/api/Topic/HomePageListRead",
			"env":   "2",
		}).
		Post(url)
	if err != nil {
		logger.SugaredLogger.Errorf("HotTopic err:%s", err.Error())
		return []any{}
	}
	//logger.SugaredLogger.Infof("HotTopic:%s", resp.Body())
	respMap := map[string]any{}
	err = json.Unmarshal(resp.Body(), &respMap)
	return respMap["re"].([]any)

}

func (m MarketNewsApi) InvestCalendar(yearMonth string) []any {
	if yearMonth == "" {
		yearMonth = time.Now().Format("2006-01")
	}

	url := "https://app.jiuyangongshe.com/jystock-app/api/v1/timeline/list"
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "app.jiuyangongshe.com").
		SetHeader("Origin", "https://www.jiuyangongshe.com").
		SetHeader("Referer", "https://www.jiuyangongshe.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetHeader("Content-Type", "application/json").
		SetHeader("token", "1cc6380a05c652b922b3d85124c85473").
		SetHeader("platform", "3").
		SetHeader("Cookie", "SESSION=NDZkNDU2ODYtODEwYi00ZGZkLWEyY2ItNjgxYzY4ZWMzZDEy").
		SetHeader("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10)).
		SetBody(map[string]string{
			"date":  yearMonth,
			"grade": "0",
		}).
		Post(url)
	if err != nil {
		logger.SugaredLogger.Errorf("InvestCalendar err:%s", err.Error())
		return []any{}
	}
	//logger.SugaredLogger.Infof("InvestCalendar:%s", resp.Body())
	respMap := map[string]any{}
	err = json.Unmarshal(resp.Body(), &respMap)
	return respMap["data"].([]any)

}

func (m MarketNewsApi) ClsCalendar() []any {
	url := "https://www.cls.cn/api/calendar/web/list?app=CailianpressWeb&flag=0&os=web&sv=8.4.6&type=0&sign=4b839750dc2f6b803d1c8ca00d2b40be"
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "www.cls.cn").
		SetHeader("Origin", "https://www.cls.cn").
		SetHeader("Referer", "https://www.cls.cn/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("ClsCalendar err:%s", err.Error())
		return []any{}
	}
	respMap := map[string]any{}
	err = json.Unmarshal(resp.Body(), &respMap)
	return respMap["data"].([]any)
}

func (m MarketNewsApi) GetGDP() *models.GDPResp {
	res := &models.GDPResp{}

	url := "https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&columns=REPORT_DATE%2CTIME%2CDOMESTICL_PRODUCT_BASE%2CFIRST_PRODUCT_BASE%2CSECOND_PRODUCT_BASE%2CTHIRD_PRODUCT_BASE%2CSUM_SAME%2CFIRST_SAME%2CSECOND_SAME%2CTHIRD_SAME&pageNumber=1&pageSize=20&sortColumns=REPORT_DATE&sortTypes=-1&source=WEB&client=WEB&reportName=RPT_ECONOMY_GDP&p=1&pageNo=1&pageNum=1&_=" + strconv.FormatInt(time.Now().Unix(), 10)
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "datacenter-web.eastmoney.com").
		SetHeader("Origin", "https://datacenter.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/cjsj/gdp.html").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("GDP err:%s", err.Error())
		return res
	}
	body := resp.Body()
	logger.SugaredLogger.Debugf("GDP:%s", body)
	vm := otto.New()
	vm.Run("function data(res){return res};")

	val, err := vm.Run(body)
	if err != nil {
		logger.SugaredLogger.Errorf("GDP err:%s", err.Error())
		return res
	}
	data, _ := val.Object().Value().Export()
	logger.SugaredLogger.Infof("GDP:%v", data)
	marshal, err := json.Marshal(data)
	if err != nil {
		return res
	}
	json.Unmarshal(marshal, &res)
	logger.SugaredLogger.Infof("GDP:%+v", res)
	return res
}

func (m MarketNewsApi) GetCPI() *models.CPIResp {
	res := &models.CPIResp{}

	url := "https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&columns=REPORT_DATE%2CTIME%2CNATIONAL_SAME%2CNATIONAL_BASE%2CNATIONAL_SEQUENTIAL%2CNATIONAL_ACCUMULATE%2CCITY_SAME%2CCITY_BASE%2CCITY_SEQUENTIAL%2CCITY_ACCUMULATE%2CRURAL_SAME%2CRURAL_BASE%2CRURAL_SEQUENTIAL%2CRURAL_ACCUMULATE&pageNumber=1&pageSize=20&sortColumns=REPORT_DATE&sortTypes=-1&source=WEB&client=WEB&reportName=RPT_ECONOMY_CPI&p=1&pageNo=1&pageNum=1&_=" + strconv.FormatInt(time.Now().Unix(), 10)
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "datacenter-web.eastmoney.com").
		SetHeader("Origin", "https://datacenter.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/cjsj/gdp.html").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("GetCPI err:%s", err.Error())
		return res
	}
	body := resp.Body()
	logger.SugaredLogger.Debugf("GetCPI:%s", body)
	vm := otto.New()
	vm.Run("function data(res){return res};")

	val, err := vm.Run(body)
	if err != nil {
		logger.SugaredLogger.Errorf("GetCPI err:%s", err.Error())
		return res
	}
	data, _ := val.Object().Value().Export()
	logger.SugaredLogger.Infof("GetCPI:%v", data)
	marshal, err := json.Marshal(data)
	if err != nil {
		return res
	}
	json.Unmarshal(marshal, &res)
	logger.SugaredLogger.Infof("GetCPI:%+v", res)
	return res
}

// GetPPI PPI
func (m MarketNewsApi) GetPPI() *models.PPIResp {
	res := &models.PPIResp{}
	url := "https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&columns=REPORT_DATE,TIME,BASE,BASE_SAME,BASE_ACCUMULATE&pageNumber=1&pageSize=20&sortColumns=REPORT_DATE&sortTypes=-1&source=WEB&client=WEB&reportName=RPT_ECONOMY_PPI&p=1&pageNo=1&pageNum=1&_=" + strconv.FormatInt(time.Now().Unix(), 10)
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "datacenter-web.eastmoney.com").
		SetHeader("Origin", "https://datacenter.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/cjsj/gdp.html").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("GetPPI err:%s", err.Error())
		return res
	}
	body := resp.Body()
	vm := otto.New()
	vm.Run("function data(res){return res};")

	val, err := vm.Run(body)
	if err != nil {
		return res
	}
	data, _ := val.Object().Value().Export()
	marshal, err := json.Marshal(data)
	if err != nil {
		return res
	}
	json.Unmarshal(marshal, &res)
	return res
}

func (m MarketNewsApi) GetPMI() *models.PMIResp {
	res := &models.PMIResp{}
	url := "https://datacenter-web.eastmoney.com/api/data/v1/get?callback=data&columns=REPORT_DATE%2CTIME%2CMAKE_INDEX%2CMAKE_SAME%2CNMAKE_INDEX%2CNMAKE_SAME&pageNumber=1&pageSize=20&sortColumns=REPORT_DATE&sortTypes=-1&source=WEB&client=WEB&reportName=RPT_ECONOMY_PMI&p=1&pageNo=1&pageNum=1&_=" + strconv.FormatInt(time.Now().Unix(), 10)
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "datacenter-web.eastmoney.com").
		SetHeader("Origin", "https://datacenter.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/cjsj/gdp.html").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		return res
	}
	body := resp.Body()
	vm := otto.New()
	vm.Run("function data(res){return res};")

	val, err := vm.Run(body)
	if err != nil {
		return res
	}
	data, _ := val.Object().Value().Export()
	marshal, err := json.Marshal(data)
	if err != nil {
		return res
	}
	json.Unmarshal(marshal, &res)
	return res

}
func (m MarketNewsApi) GetIndustryReportInfo(infoCode string) string {
	url := "https://data.eastmoney.com/report/zw_industry.jshtml?infocode=" + infoCode
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "data.eastmoney.com").
		SetHeader("Origin", "https://data.eastmoney.com").
		SetHeader("Referer", "https://data.eastmoney.com/report/industry.jshtml").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("GetIndustryReportInfo err:%s", err.Error())
		return ""
	}
	body := resp.Body()
	//logger.SugaredLogger.Debugf("GetIndustryReportInfo:%s", body)
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	title, _ := doc.Find("div.c-title").Html()
	content, _ := doc.Find("div.ctx-content").Html()
	//logger.SugaredLogger.Infof("GetIndustryReportInfo:\n%s\n%s", title, content)
	markdown, err := util.HTMLToMarkdown(title + content)
	if err != nil {
		return ""
	}
	logger.SugaredLogger.Infof("GetIndustryReportInfo markdown:\n%s", markdown)
	return markdown
}

func (receiver MarketNewsApi) GetSecuritiesCompanyOpinion(startDate string, endDate string) *models.SecuritiesCompanyOpinionResp {
	res := models.SecuritiesCompanyOpinionResp{}

	url := fmt.Sprintf("https://reportapi.eastmoney.com/report/jg?cb=data&pageSize=50&beginTime=%s&endTime=%s&pageNo=1&fields=&qType=4&orgCode=&author=&p=1&pageNum=1&pageNumber=1&_=%d", startDate, endDate, time.Now().Unix())
	resp, err := resty.New().SetTimeout(time.Duration(30)*time.Second).R().
		SetHeader("Host", "reportapi.eastmoney.com").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("GetSecuritiesCompanyOpinion err:%s", err.Error())
		return &res
	}
	body := resp.Body()
	vm := otto.New()
	vm.Run("function data(res){return res};")

	val, _ := vm.Run(body)

	data, _ := val.Object().Value().Export()
	marshal, _ := json.Marshal(data)

	json.Unmarshal(marshal, &res)

	for _, d := range (&res).Data {
		logger.SugaredLogger.Debugf("PublishDate: %s,OrgSName: %s,Title: %s,EncodeUrl: %s", d.PublishDate, d.OrgSName, d.Title, d.EncodeUrl)
		markdown := receiver.GetSecuritiesCompanyOpinionContent(d.OrgSName, d.EncodeUrl)
		d.OpinionData = markdown
	}
	return &res
}

func (m MarketNewsApi) GetSecuritiesCompanyOpinionContent(OrgSName, encodeUrl string) string {
	url := "https://data.eastmoney.com/report/zw_brokerreport.jshtml?encodeUrl=" + encodeUrl
	resp, _ := resty.New().R().
		SetHeader("Host", "data.eastmoney.com").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		Get(url)
	body := resp.Body()
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	title, _ := doc.Find("div.c-title").Html()
	content, _ := doc.Find("div.ctx-content").Html()
	markdown, err := util.HTMLToMarkdown("<h1>" + OrgSName + "</h1>" + title + content)
	if err != nil {
	}
	return markdown
}

func (m MarketNewsApi) ReutersNew() *models.ReutersNews {
	client := resty.New()
	config := GetSettingConfig()
	if config.HttpProxyEnabled && config.HttpProxy != "" {
		client.SetProxy(config.HttpProxy)
	}
	news := &models.ReutersNews{}
	//url := "https://www.reuters.com/pf/api/v3/content/fetch/articles-by-section-alias-or-id-v1?query={\"arc-site\":\"reuters\",\"fetch_type\":\"collection\",\"offset\":0,\"section_id\":\"/world/\",\"size\":9,\"uri\":\"/world/\",\"website\":\"reuters\"}&d=300&mxId=00000000&_website=reuters"
	url := "https://www.reuters.com/pf/api/v3/content/fetch/recent-stories-by-sections-v1?query=%7B%22section_ids%22%3A%22%2Fworld%2F%22%2C%22size%22%3A4%2C%22website%22%3A%22reuters%22%7D&d=334&mxId=00000000&_website=reuters"
	_, err := client.SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Host", "www.reuters.com").
		SetHeader("Origin", "https://www.reuters.com").
		SetHeader("Referer", "https://www.reuters.com/world/china/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		SetResult(news).
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("ReutersNew err:%s", err.Error())
		return news
	}
	logger.SugaredLogger.Infof("Articles:%+v", news.Result.Articles)
	return news
}

func (m MarketNewsApi) InteractiveAnswer(page int, pageSize int, keyWord string) *models.InteractiveAnswer {
	client := resty.New()
	config := GetSettingConfig()
	if config.HttpProxyEnabled && config.HttpProxy != "" {
		client.SetProxy(config.HttpProxy)
	}
	url := fmt.Sprintf("https://irm.cninfo.com.cn/newircs/index/search?_t=%d", time.Now().Unix())
	answers := &models.InteractiveAnswer{}
	logger.SugaredLogger.Infof("请求url:%s", url)
	resp, err := client.SetTimeout(time.Duration(5)*time.Second).R().
		SetHeader("Host", "irm.cninfo.com.cn").
		SetHeader("Origin", "https://irm.cninfo.com.cn").
		SetHeader("Referer", "https://irm.cninfo.com.cn/views/interactiveAnswer").
		SetHeader("handleError", "true").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0").
		SetFormData(map[string]string{
			"pageNo":      convertor.ToString(page),
			"pageSize":    convertor.ToString(pageSize),
			"searchTypes": "11",
			"highLight":   "true",
			"keyWord":     keyWord,
		}).
		SetResult(answers).
		Post(url)
	if err != nil {
		logger.SugaredLogger.Errorf("InteractiveAnswer-err:%+v", err)
	}
	logger.SugaredLogger.Debugf("InteractiveAnswer-resp:%s", resp.Body())
	return answers

}

func (m MarketNewsApi) CailianpressWeb(searchWords string) *models.CailianpressWeb {
	res := &models.CailianpressWeb{}
	_, err := resty.New().SetTimeout(time.Second*10).R().
		SetHeader("Content-Type", "application/json").
		SetHeader("Host", "www.cls.cn").
		SetHeader("Origin", "https://www.cls.cn").
		SetHeader("Referer", "https://www.cls.cn/telegraph").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60").
		SetBody(fmt.Sprintf(`{"app":"CailianpressWeb","os":"web","sv":"8.4.6","category":"","keyword":"%s"}`, searchWords)).
		SetResult(res).
		Post("https://www.cls.cn/api/csw?app=CailianpressWeb&os=web&sv=8.4.6&sign=9f8797a1f4de66c2370f7a03990d2737")
	if err != nil {
		return nil
	}
	logger.SugaredLogger.Debug(res)

	return res
}

func (m MarketNewsApi) GetNews24HoursList(source string, limit int) *[]*models.Telegraph {
	news := &[]*models.Telegraph{}
	if source != "" {
		db.Dao.Model(news).Preload("TelegraphTags").Where("source=? and created_at>?", source, time.Now().Add(-24*time.Hour)).Order("data_time desc,is_red desc").Limit(limit).Find(news)
	} else {
		db.Dao.Model(news).Preload("TelegraphTags").Where("created_at>?", time.Now().Add(-24*time.Hour)).Order("data_time desc,is_red desc").Limit(limit).Find(news)
	}
	// 内容去重
	uniqueNews := make([]*models.Telegraph, 0)
	seenContent := make(map[string]bool)
	for _, item := range *news {
		tags := &[]models.Tags{}
		db.Dao.Model(&models.Tags{}).Where("id in ?", lo.Map(item.TelegraphTags, func(item models.TelegraphTags, index int) uint {
			return item.TagId
		})).Find(&tags)
		tagNames := lo.Map(*tags, func(item models.Tags, index int) string {
			return item.Name
		})
		item.SubjectTags = tagNames
		//logger.SugaredLogger.Infof("tagNames %v ，SubjectTags：%s", tagNames, item.SubjectTags)
		// 使用内容作为去重键值，可以考虑只使用内容的前几个字符或哈希值
		contentKey := strings.TrimSpace(item.Content)
		if contentKey != "" && !seenContent[contentKey] {
			seenContent[contentKey] = true
			uniqueNews = append(uniqueNews, item)
		}
	}
	return &uniqueNews
}

// ===================== 市场情绪多维度评分相关方法 =====================

// LimitUpDownData 涨跌停数据结构
type LimitUpDownData struct {
	LimitUpCount   int     `json:"limitUpCount"`   // 涨停家数
	LimitDownCount int     `json:"limitDownCount"` // 跌停家数
	Score          float64 `json:"score"`          // 该维度得分
	Weight         float64 `json:"weight"`         // 权重 0.30
}

// UpDownCountData 涨跌家数数据结构
type UpDownCountData struct {
	UpCount   int     `json:"upCount"`   // 上涨家数
	DownCount int     `json:"downCount"` // 下跌家数
	FlatCount int     `json:"flatCount"` // 平盘家数
	Ratio     float64 `json:"ratio"`     // 涨跌比
	Score     float64 `json:"score"`     // 该维度得分
	Weight    float64 `json:"weight"`    // 权重 0.25
}

// NorthFundData 北向资金数据结构
type NorthFundData struct {
	NetInflow float64 `json:"netInflow"` // 北向资金净流入（亿元）
	SHInflow  float64 `json:"shInflow"`  // 沪股通净流入
	SZInflow  float64 `json:"szInflow"`  // 深股通净流入
	Score     float64 `json:"score"`     // 该维度得分
	Weight    float64 `json:"weight"`    // 权重 0.20
}

// crawlLimitUpDownData 爬取涨跌停数据（东方财富）
func (m MarketNewsApi) crawlLimitUpDownData() *LimitUpDownData {
	// 东方财富涨停板数据接口
	url := "https://datacenter-web.eastmoney.com/api/data/v1/get"
	params := map[string]string{
		"sortColumns": "LATEST_TIME",
		"sortTypes":   "-1",
		"pageSize":    "500",
		"pageNumber":  "1",
		"reportName":  "RPT_LIMITER_POOL",
		"columns":     "ALL",
		"source":      "WEB",
		"client":      "WEB",
		"filter":      fmt.Sprintf("(TRADE_DATE='%s')", time.Now().Format("2006-01-02")),
	}

	resp, err := resty.New().SetTimeout(10 * time.Second).R().
		SetQueryParams(params).
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("crawlLimitUpDownData error: %v", err)
		return &LimitUpDownData{}
	}

	// 解析返回数据，统计涨停数量
	limitUpCount := gjson.Get(string(resp.Body()), "result.count").Int()

	// 跌停池
	params["reportName"] = "RPT_LIMITER_POOL_DOWN"
	resp2, err := resty.New().SetTimeout(10 * time.Second).R().
		SetQueryParams(params).
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("crawlLimitUpDownData down error: %v", err)
		return &LimitUpDownData{LimitUpCount: int(limitUpCount)}
	}
	limitDownCount := gjson.Get(string(resp2.Body()), "result.count").Int()

	return &LimitUpDownData{
		LimitUpCount:   int(limitUpCount),
		LimitDownCount: int(limitDownCount),
	}
}

// crawlUpDownCountData 爬取涨跌家数数据（东方财富）
func (m MarketNewsApi) crawlUpDownCountData() *UpDownCountData {
	// 东方财富市场统计接口
	url := "https://push2.eastmoney.com/api/qt/clist/get"
	params := map[string]string{
		"pn":     "1",
		"pz":     "5000",
		"po":     "1",
		"np":     "1",
		"fltt":   "2",
		"invt":   "2",
		"fid":    "f3",
		"fs":     "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23", // A股
		"fields": "f3",                                // 涨跌幅
	}

	resp, err := resty.New().SetTimeout(10 * time.Second).R().
		SetQueryParams(params).
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("crawlUpDownCountData error: %v", err)
		return &UpDownCountData{}
	}

	// 解析并统计
	data := gjson.Get(string(resp.Body()), "data.diff").Array()
	upCount, downCount, flatCount := 0, 0, 0
	for _, item := range data {
		change := item.Get("f3").Float()
		if change > 0 {
			upCount++
		} else if change < 0 {
			downCount++
		} else {
			flatCount++
		}
	}

	return &UpDownCountData{
		UpCount:   upCount,
		DownCount: downCount,
		FlatCount: flatCount,
	}
}

// crawlNorthFundData 爬取北向资金数据（东方财富沪深港通）
func (m MarketNewsApi) crawlNorthFundData() *NorthFundData {
	// 东方财富沪深港通资金流向
	url := "https://push2.eastmoney.com/api/qt/kamt.rtmin/get"
	params := map[string]string{
		"fields1": "f1,f2,f3,f4",
		"fields2": "f51,f52,f53,f54,f55,f56",
	}

	resp, err := resty.New().SetTimeout(10 * time.Second).R().
		SetQueryParams(params).
		Get(url)
	if err != nil {
		logger.SugaredLogger.Errorf("crawlNorthFundData error: %v", err)
		return &NorthFundData{}
	}

	body := string(resp.Body())
	// f1: 沪股通净流入，f2: 深股通净流入，f3: 北向资金合计 (单位：万元)
	shInflow := gjson.Get(body, "data.f1").Float() / 10000 // 转换为亿
	szInflow := gjson.Get(body, "data.f2").Float() / 10000
	netInflow := gjson.Get(body, "data.f3").Float() / 10000

	return &NorthFundData{
		NetInflow: netInflow,
		SHInflow:  shInflow,
		SZInflow:  szInflow,
	}
}

// calculateLimitScore 计算涨跌停维度得分
func calculateLimitScore(limitUp, limitDown int) float64 {
	total := limitUp + limitDown
	if total == 0 {
		return 0
	}
	// (涨停数 - 跌停数) / 总数 * 100
	return float64(limitUp-limitDown) / float64(total) * 100
}

// calculateUpDownScore 计算涨跌家数维度得分
func calculateUpDownScore(up, down int) float64 {
	total := up + down
	if total == 0 {
		return 0
	}
	ratio := float64(up) / float64(total)
	// ratio 0~1 映射到 -100~100
	return (ratio - 0.5) * 200
}

// calculateNorthScore 计算北向资金维度得分
func calculateNorthScore(netInflow float64) float64 {
	// 假设 ±100亿 为满分边界
	score := netInflow // 直接用净流入亿元数作为基础
	if score > 100 {
		score = 100
	}
	if score < -100 {
		score = -100
	}
	return score
}

// GetMarketSentimentMultiDimensional 多维度市场情绪综合评分
// 权重：涨跌停30% + 涨跌家数25% + 北向资金20% + NLP情感25%
func (m MarketNewsApi) GetMarketSentimentMultiDimensional() map[string]any {
	result := make(map[string]any)

	// 1. 获取涨跌停数据（爬取东方财富）
	limitData := m.crawlLimitUpDownData()
	limitScore := calculateLimitScore(limitData.LimitUpCount, limitData.LimitDownCount)

	// 2. 获取涨跌家数数据（爬取东方财富）
	upDownData := m.crawlUpDownCountData()
	upDownScore := calculateUpDownScore(upDownData.UpCount, upDownData.DownCount)

	// 3. 获取北向资金数据（爬取东方财富沪深港通）
	northData := m.crawlNorthFundData()
	northScore := calculateNorthScore(northData.NetInflow)

	// 4. 获取NLP情感分析（调用现有方法）
	nlpResult, _ := NewsAnalyze("", false)
	nlpScore := nlpResult.Score * 0.2 // 原有逻辑中的缩放

	// 5. 加权求和
	totalScore := limitScore*0.30 + upDownScore*0.25 + northScore*0.20 + nlpScore*0.25

	// 限制在 -100 ~ 100
	if totalScore > 100 {
		totalScore = 100
	}
	if totalScore < -100 {
		totalScore = -100
	}

	// 计算涨跌比
	upDownRatio := 0.0
	if upDownData.UpCount+upDownData.DownCount > 0 {
		upDownRatio = float64(upDownData.UpCount) / float64(upDownData.UpCount+upDownData.DownCount)
	}

	result["totalScore"] = totalScore
	result["limitUpDown"] = map[string]any{
		"limitUpCount":   limitData.LimitUpCount,
		"limitDownCount": limitData.LimitDownCount,
		"score":          limitScore,
		"weight":         0.30,
	}
	result["upDownCount"] = map[string]any{
		"upCount":   upDownData.UpCount,
		"downCount": upDownData.DownCount,
		"flatCount": upDownData.FlatCount,
		"ratio":     upDownRatio,
		"score":     upDownScore,
		"weight":    0.25,
	}
	result["northFund"] = map[string]any{
		"netInflow": northData.NetInflow,
		"shInflow":  northData.SHInflow,
		"szInflow":  northData.SZInflow,
		"score":     northScore,
		"weight":    0.20,
	}
	result["nlpSentiment"] = map[string]any{
		"score":           nlpResult.Score,
		"normalizedScore": nlpScore,
		"description":     nlpResult.Description,
		"weight":          0.25,
	}
	result["updateTime"] = time.Now().Format("2006-01-02 15:04:05")

	return result
}

// GetIndustryHeatMap 获取行业热力图整合数据
func (m MarketNewsApi) GetIndustryHeatMap() map[string]any {
	result := make(map[string]any)

	// 1. 获取行业排行（腾讯财经）
	rankData := m.GetIndustryRank("desc", 30)

	// 2. 获取行业资金流（新浪）
	moneyData := m.GetIndustryMoneyRankSina("0", "netamount") // 0=行业板块

	// 整合数据
	industries := make([]map[string]any, 0)
	topConcepts := make([]string, 0, 8)

	if data, ok := rankData["data"].([]any); ok {
		for i, item := range data {
			if row, ok := item.([]any); ok && len(row) >= 5 {
				name := fmt.Sprintf("%v", row[1])
				change, _ := strconv.ParseFloat(fmt.Sprintf("%v", row[2]), 64)
				volume := fmt.Sprintf("%v", row[4])

				// 查找对应的资金流数据
				netInflow := 0.0
				for _, money := range moneyData {
					if money["name"] == name {
						if val, ok := money["netamount"].(string); ok {
							netInflow, _ = strconv.ParseFloat(val, 64)
						}
						break
					}
				}

				flowDirection := "in"
				if netInflow < 0 {
					flowDirection = "out"
				}

				industries = append(industries, map[string]any{
					"name":          name,
					"code":          fmt.Sprintf("%v", row[0]),
					"change":        change,
					"volume":        volume,
					"netInflow":     netInflow,
					"flowDirection": flowDirection,
				})

				// 取涨幅 Top 8 作为热门概念
				if i < 8 && change > 0 {
					topConcepts = append(topConcepts, name)
				}
			}
		}
	}

	result["industries"] = industries
	result["topConcepts"] = topConcepts
	result["updateTime"] = time.Now().Format("2006-01-02 15:04:05")

	return result
}

// GetHotWords 获取24H热词
func (m MarketNewsApi) GetHotWords() []map[string]any {
	// 调用现有的 NewsAnalyze 方法
	_, frequencies := NewsAnalyze("", false)

	hotWords := make([]map[string]any, 0)
	for i, freq := range frequencies {
		if i >= 10 { // Top 10
			break
		}

		// 计算热度（频次 * 权重）
		heat := int(float64(freq.Frequency) * freq.Weight / 10)
		if heat > 100 {
			heat = 100
		}

		// 简单趋势判断（可扩展为与历史对比）
		trend := "flat"
		if freq.Score > 0 {
			trend = "up"
		} else if freq.Score < 0 {
			trend = "down"
		}

		hotWords = append(hotWords, map[string]any{
			"word":   freq.Word,
			"heat":   heat,
			"trend":  trend,
			"change": fmt.Sprintf("%+.0f%%", freq.Score),
		})
	}

	return hotWords
}

// GetMarketEvents 获取日内市场事件时间轴
func (m MarketNewsApi) GetMarketEvents() []map[string]any {
	events := make([]map[string]any, 0)
	today := time.Now().Format("2006-01-02")

	// 1. 重要快讯（isRed=true）
	news := &[]models.Telegraph{}
	db.Dao.Model(news).
		Where("is_red = ? AND DATE(data_time) = ?", true, today).
		Order("data_time desc").
		Limit(20).
		Find(news)

	for _, n := range *news {
		events = append(events, map[string]any{
			"time":        n.Time,
			"type":        "news",
			"typeLabel":   "快讯",
			"title":       n.Title,
			"description": n.Content,
			"isImportant": true,
		})
	}

	// 2. 行业异动（涨跌幅超过3%的行业）
	industryRank := m.GetIndustryRank("desc", 50)
	if data, ok := industryRank["data"].([]any); ok {
		for _, item := range data {
			if row, ok := item.([]any); ok && len(row) > 2 {
				change, _ := strconv.ParseFloat(fmt.Sprintf("%v", row[2]), 64)
				if change > 3 || change < -3 {
					events = append(events, map[string]any{
						"time":        time.Now().Format("15:04"),
						"type":        "industry",
						"typeLabel":   "行业",
						"title":       fmt.Sprintf("%v 大幅异动", row[1]),
						"description": fmt.Sprintf("涨跌幅 %.2f%%", change),
						"isImportant": change > 5 || change < -5,
					})
				}
			}
		}
	}

	// 3. 北向资金异动（净流入超过50亿）
	northData := m.crawlNorthFundData()
	if northData.NetInflow > 50 || northData.NetInflow < -50 {
		direction := "净流入"
		if northData.NetInflow < 0 {
			direction = "净流出"
		}
		events = append(events, map[string]any{
			"time":        time.Now().Format("15:04"),
			"type":        "northfund",
			"typeLabel":   "资金",
			"title":       fmt.Sprintf("北向资金%s%.2f亿", direction, math.Abs(northData.NetInflow)),
			"description": fmt.Sprintf("沪股通%.2f亿，深股通%.2f亿", northData.SHInflow, northData.SZInflow),
			"isImportant": true,
		})
	}

	// 按时间倒序排列
	sort.Slice(events, func(i, j int) bool {
		return events[i]["time"].(string) > events[j]["time"].(string)
	})

	return events
}
