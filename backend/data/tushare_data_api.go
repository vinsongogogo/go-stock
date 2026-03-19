package data

import (
	"fmt"
	"github.com/duke-git/lancet/v2/convertor"
	"github.com/duke-git/lancet/v2/slice"
	"github.com/duke-git/lancet/v2/strutil"
	"github.com/go-resty/resty/v2"
	"go-stock/backend/db"
	"go-stock/backend/logger"
	"go-stock/backend/models"
	"strings"
	"time"
)

// @Date 2025/2/17 12:33
// @Desc
//-----------------------------------------------------------------------------------

type TushareApi struct {
	client *resty.Client
	config *SettingConfig
}

func NewTushareApi(config *SettingConfig) *TushareApi {
	return &TushareApi{
		client: resty.New(),
		config: config,
	}
}

// GetDaily tushare A股日线行情
func (receiver TushareApi) GetDaily(tsCode, startDate, endDate string, crawlTimeOut int64) string {
	//logger.SugaredLogger.Debugf("tushare daily request: ts_code=%s, start_date=%s, end_date=%s", tsCode, startDate, endDate)
	fields := "ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount"
	resp := &TushareStockBasicResponse{}
	stockType := getStockType(tsCode)
	tsCodeNEW := getTsCode(tsCode)
	//logger.SugaredLogger.Debugf("tushare daily request: %s,tsCode:%s,tsCodeNEW:%s", stockType, tsCode, tsCodeNEW)
	_, err := receiver.client.SetTimeout(time.Duration(crawlTimeOut)*time.Second).R().
		SetHeader("content-type", "application/json").
		SetBody(&TushareRequest{
			ApiName: stockType,
			Token:   receiver.config.TushareToken,
			Params: map[string]any{
				"ts_code":    tsCodeNEW,
				"start_date": startDate,
				"end_date":   endDate,
			},
			Fields: fields}).
		SetResult(resp).
		Post(tushareApiUrl)
	if err != nil {
		logger.SugaredLogger.Error(err)
		return ""
	}
	res := ""
	if resp.Data.Items != nil && len(resp.Data.Items) > 0 {
		fieldsStr := slice.JoinFunc(resp.Data.Fields, ",", func(s string) string {
			return "\"" + convertor.ToString(s) + "\""
		})
		res += fieldsStr + "\n"
		for _, item := range resp.Data.Items {
			//logger.SugaredLogger.Debugf("%s", slice.Join(item, ","))
			t := slice.JoinFunc(item, ",", func(s any) any {
				return "\"" + convertor.ToString(s) + "\""
			})
			res += t + "\n"
		}
	}
	//logger.SugaredLogger.Debugf("tushare response: %s", res)
	return res
}

func getTsCode(code string) any {
	if strutil.HasPrefixAny(code, []string{"US", "us", "gb_"}) {
		code = strings.Replace(code, "gb_", "", 1)
		code = strings.Replace(code, "us", "", 1)
		return code
	}
	return code
}

func getStockType(code string) string {
	if strutil.HasSuffixAny(code, []string{"SZ", "SH", "sh", "sz"}) {
		return "daily"
	}
	if strutil.HasSuffixAny(code, []string{"HK", "hk"}) {
		return "hk_daily"
	}
	if strutil.HasPrefixAny(code, []string{"US", "us", "gb_"}) {
		return "us_daily"
	}
	return ""
}

// TushareNewsResponse Tushare news 接口响应结构
type TushareNewsResponse struct {
	RequestId string `json:"request_id"`
	Code      int    `json:"code"`
	Msg       string `json:"msg"`
	Data      struct {
		Fields []string `json:"fields"`
		Items  [][]any  `json:"items"`
	} `json:"data"`
}

// GetNews 获取 Tushare 财经快讯
// src: 数据来源 (sina/wallstreetcn/10jqka/eastmoney/cls/yuncaijing/jinse/gelonghui/cailianpress)
// startDate, endDate: 日期范围 YYYYMMDD
func (receiver TushareApi) GetNews(src, startDate, endDate string) ([]models.Telegraph, error) {
	if receiver.config.TushareToken == "" {
		return nil, fmt.Errorf("TushareToken not configured")
	}

	if startDate == "" {
		startDate = time.Now().Format("20060102")
	}
	if endDate == "" {
		endDate = time.Now().Format("20060102")
	}

	resp := &TushareNewsResponse{}
	_, err := receiver.client.SetTimeout(30*time.Second).R().
		SetHeader("content-type", "application/json").
		SetBody(&TushareRequest{
			ApiName: "news",
			Token:   receiver.config.TushareToken,
			Params: map[string]any{
				"src":        src,
				"start_date": startDate,
				"end_date":   endDate,
			},
			Fields: "datetime,content,title,channels",
		}).
		SetResult(resp).
		Post(tushareApiUrl)

	if err != nil {
		logger.SugaredLogger.Errorf("GetNews error: %v", err)
		return nil, err
	}

	if resp.Code != 0 {
		return nil, fmt.Errorf("tushare error: %s", resp.Msg)
	}

	// 解析并转存到 Telegraph 表
	var telegraphs []models.Telegraph
	for _, item := range resp.Data.Items {
		if len(item) < 4 {
			continue
		}

		datetime, _ := time.ParseInLocation("2006-01-02 15:04:05", fmt.Sprintf("%v", item[0]), time.Local)
		content := fmt.Sprintf("%v", item[1])
		title := fmt.Sprintf("%v", item[2])

		telegraph := models.Telegraph{
			Title:           title,
			Content:         content,
			DataTime:        &datetime,
			Time:            datetime.Format("15:04:05"),
			Source:          "tushare",
			SentimentResult: AnalyzeSentiment(content).Description,
		}

		// 去重检查
		cnt := int64(0)
		if telegraph.Title != "" {
			db.Dao.Model(&telegraph).Where("title=? AND source=?", telegraph.Title, "tushare").Count(&cnt)
		} else {
			db.Dao.Model(&telegraph).Where("content=? AND source=?", telegraph.Content, "tushare").Count(&cnt)
		}

		if cnt == 0 {
			db.Dao.Create(&telegraph)
			telegraphs = append(telegraphs, telegraph)
		}
	}

	return telegraphs, nil
}
