package data

import (
	"encoding/json"
	"go-stock/backend/db"
	"go-stock/backend/logger"
	"go-stock/backend/models"
	"go-stock/backend/util"
	"path/filepath"
	"strings"
	"testing"

	"github.com/coocood/freecache"
	"github.com/duke-git/lancet/v2/random"
	"github.com/duke-git/lancet/v2/strutil"
	"github.com/go-resty/resty/v2"
	"github.com/tidwall/gjson"
)

// @Date 2025/4/23 17:58
// @Desc
//-----------------------------------------------------------------------------------

func TestGetSinaNews(t *testing.T) {
	db.Init("../../data/stock.db")
	InitAnalyzeSentiment()
	news := NewMarketNewsApi().GetSinaNews(30)
	for i, telegraph := range *news {
		logger.SugaredLogger.Debugf("key: %+v, value: %+v", i, telegraph)

	}
	//NewMarketNewsApi().GetNewTelegraph(30)

}

func TestGlobalStockIndexes(t *testing.T) {
	resp := NewMarketNewsApi().GlobalStockIndexes(30)
	bytes, err := json.Marshal(resp)
	if err != nil {
		return
	}
	logger.SugaredLogger.Debugf("resp: %+v", string(bytes))
}

func TestGetIndustryRank(t *testing.T) {
	res := NewMarketNewsApi().GetIndustryRank("desc", 10)
	if data, ok := res["data"].([]any); ok {
		for s, a := range data {
			logger.SugaredLogger.Debugf("key: %+v, value: %+v", s, a)
		}
	}
}
func TestGetIndustryMoneyRankSina(t *testing.T) {
	res := NewMarketNewsApi().GetIndustryMoneyRankSina("0", "netamount")
	for i, re := range res {
		logger.SugaredLogger.Debugf("key: %+v, value: %+v", i, re)

	}
}

// TestGetIndustryHeatMap 测试行业热力图数据获取
func TestGetIndustryHeatMap(t *testing.T) {
	res := NewMarketNewsApi().GetIndustryHeatMap()
	rawBytes, _ := json.Marshal(res)
	logger.SugaredLogger.Debugf("行业热力图数据: %s", string(rawBytes))

	// 验证数据完整性
	if industries, ok := res["industries"].([]map[string]any); ok {
		t.Logf("获取到 %d 个行业数据", len(industries))
		if len(industries) == 0 {
			t.Error("行业数据为空")
		}
		// 检查资金流数据
		hasNetInflow := false
		for _, ind := range industries {
			if netInflow, ok := ind["netInflow"].(float64); ok && netInflow != 0 {
				hasNetInflow = true
				break
			}
		}
		if !hasNetInflow {
			t.Error("所有行业资金流都为0")
		}
	} else {
		t.Error("返回数据格式异常")
	}

	if topConcepts, ok := res["topConcepts"].([]string); ok {
		t.Logf("热门概念: %v", topConcepts)
		if len(topConcepts) == 0 {
			t.Error("topConcepts 为空")
		}
	}
}
func TestGetMoneyRankSina(t *testing.T) {
	res := NewMarketNewsApi().GetMoneyRankSina("r3_net")
	for i, re := range res {
		logger.SugaredLogger.Debugf("key: %+v, value: %+v", i, re)
	}
}

func TestGetStockMoneyTrendByDay(t *testing.T) {
	res := NewMarketNewsApi().GetStockMoneyTrendByDay("sh600438", 360)
	for i, re := range res {
		logger.SugaredLogger.Debugf("key: %+v, value: %+v", i, re)
	}
}
func TestTopStocksRankingList(t *testing.T) {
	NewMarketNewsApi().TopStocksRankingList("2025-05-19")
}

func TestLongTiger(t *testing.T) {
	db.Init("../../data/stock.db")

	NewMarketNewsApi().LongTiger("2025-06-08")
}

func TestStockResearchReport(t *testing.T) {
	db.Init("../../data/stock.db")
	resp := NewMarketNewsApi().StockResearchReport("002046", 7)
	for _, a := range resp {
		logger.SugaredLogger.Debugf("value: %+v", a)
		data := a.(map[string]any)
		logger.SugaredLogger.Debugf("value: %s  infoCode:%s", data["title"], data["infoCode"])
		NewMarketNewsApi().GetIndustryReportInfo(data["infoCode"].(string))
	}
}

func TestIndustryResearchReport(t *testing.T) {
	db.Init("../../data/stock.db")
	resp := NewMarketNewsApi().IndustryResearchReport("", 7)
	for _, a := range resp {
		logger.SugaredLogger.Debugf("value: %+v", a)
		data := a.(map[string]any)
		logger.SugaredLogger.Debugf("value: %s  infoCode:%s", data["title"], data["infoCode"])
		logger.SugaredLogger.Debugf("url: https://pdf.dfcfw.com/pdf/H3_%s_1.pdf", data["infoCode"])
		//NewMarketNewsApi().GetIndustryReportInfo(data["infoCode"].(string))
	}
}

func TestStockNotice(t *testing.T) {
	db.Init("../../data/stock.db")
	resp := NewMarketNewsApi().StockNotice("600584,600900")
	for _, a := range resp {
		logger.SugaredLogger.Debugf("value: %+v", a)
	}

}

func TestEMDictCode(t *testing.T) {
	db.Init("../../data/stock.db")
	resp := NewMarketNewsApi().EMDictCode("016", freecache.NewCache(100))
	for _, a := range resp {
		logger.SugaredLogger.Debugf("value: %+v", a)
	}
	bytes, err := json.Marshal(resp)
	if err != nil {
		return
	}
	dict := &[]models.BKDict{}
	json.Unmarshal(bytes, dict)
	logger.SugaredLogger.Debugf("value: %s", string(bytes))
	md := util.MarkdownTableWithTitle("行业/板块代码", dict)
	logger.SugaredLogger.Debugf(md)

}

func TestTradingViewNews(t *testing.T) {
	db.Init("../../data/stock.db")
	InitAnalyzeSentiment()
	NewMarketNewsApi().TradingViewNews()
}

func TestXUEQIUHotStock(t *testing.T) {
	db.Init("../../data/stock.db")
	res := NewMarketNewsApi().XUEQIUHotStock(50, "10")
	for _, a := range *res {
		logger.SugaredLogger.Debugf("value: %+v", a)
	}

	md := util.MarkdownTableWithTitle("当前热门股票排名", res)
	logger.SugaredLogger.Debugf(md)
}

func TestHotEvent(t *testing.T) {
	db.Init("../../data/stock.db")
	res := NewMarketNewsApi().HotEvent(50)
	for _, a := range *res {
		logger.SugaredLogger.Debugf("value: %+v", a)
	}

}

func TestHotTopic(t *testing.T) {
	db.Init("../../data/stock.db")
	res := NewMarketNewsApi().HotTopic(10)
	for _, a := range res {
		logger.SugaredLogger.Debugf("value: %+v", a)
	}

}

func TestInvestCalendar(t *testing.T) {
	db.Init("../../data/stock.db")
	res := NewMarketNewsApi().InvestCalendar("2025-06")
	for _, a := range res {
		bytes, err := json.Marshal(a)
		if err != nil {
			continue
		}
		date := gjson.Get(string(bytes), "date")
		list := gjson.Get(string(bytes), "list")

		logger.SugaredLogger.Debugf("value: %+v,list: %+v", date.String(), list)
	}
}

func TestClsCalendar(t *testing.T) {
	db.Init("../../data/stock.db")
	res := NewMarketNewsApi().ClsCalendar()
	md := strings.Builder{}
	for _, a := range res {
		bytes, err := json.Marshal(a)
		if err != nil {
			continue
		}
		//logger.SugaredLogger.Debugf("value: %+v", string(bytes))
		date := gjson.Get(string(bytes), "calendar_day")
		md.WriteString("\n### 事件/会议日期：" + date.String())
		list := gjson.Get(string(bytes), "items")
		//logger.SugaredLogger.Debugf("value: %+v,list: %+v", date.String(), list)
		list.ForEach(func(key, value gjson.Result) bool {
			logger.SugaredLogger.Debugf("key: %+v,value: %+v", key.String(), gjson.Get(value.String(), "title"))
			md.WriteString("\n- " + gjson.Get(value.String(), "title").String())
			return true
		})
	}
	logger.SugaredLogger.Debugf("md:\n %s", md.String())
}

func TestGetGDP(t *testing.T) {
	res := NewMarketNewsApi().GetGDP()
	md := util.MarkdownTableWithTitle("国内生产总值(GDP)", res.GDPResult.Data)
	logger.SugaredLogger.Debugf(md)
}
func TestGetCPI(t *testing.T) {
	res := NewMarketNewsApi().GetCPI()
	md := util.MarkdownTableWithTitle("居民消费价格指数(CPI)", res.CPIResult.Data)
	logger.SugaredLogger.Debugf(md)
}

// PPI
func TestGetPPI(t *testing.T) {
	res := NewMarketNewsApi().GetPPI()
	md := util.MarkdownTableWithTitle("工业品出厂价格指数(PPI)", res.PPIResult.Data)
	logger.SugaredLogger.Debugf(md)
}

// PMI
func TestGetPMI(t *testing.T) {
	res := NewMarketNewsApi().GetPMI()
	md := util.MarkdownTableWithTitle("采购经理人指数(PMI)", res.PMIResult.Data)
	logger.SugaredLogger.Debugf(md)
}
func TestGetIndustryReportInfo(t *testing.T) {
	NewMarketNewsApi().GetIndustryReportInfo("AP202507151709216483")
}

func TestReutersNew(t *testing.T) {
	db.Init("../../data/stock.db")
	NewMarketNewsApi().ReutersNew()
}

func TestInteractiveAnswer(t *testing.T) {
	db.Init("../../data/stock.db")
	datas := NewMarketNewsApi().InteractiveAnswer(1, 100, "立讯精密")
	logger.SugaredLogger.Debugf("PageSize:%d", datas.PageSize)
	md := util.MarkdownTableWithTitle("投资互动", datas.Results)
	logger.SugaredLogger.Debugf(md)

}
func TestGetNewsList2(t *testing.T) {
	db.Init("../../data/stock.db")
	news := NewMarketNewsApi().GetNewsList2("财联社电报", random.RandInt(100, 500))
	messageText := strings.Builder{}
	for _, telegraph := range *news {
		messageText.WriteString("## " + telegraph.Time + ":" + "\n")
		messageText.WriteString("### " + telegraph.Content + "\n")
	}
	logger.SugaredLogger.Debugf("value: %s", messageText.String())
}

func TestTelegraphList(t *testing.T) {
	db.Init("../../data/stock.db")
	InitAnalyzeSentiment()
	NewMarketNewsApi().TelegraphList(30)
}

func TestProxy(t *testing.T) {
	response, err := resty.New().
		SetProxy("http://go-stock:778d4ff2-73f3-4d56-b3c3-d9a730a06ae3@stock.sparkmemory.top:8888").
		R().
		SetHeader("Host", "news-mediator.tradingview.com").
		SetHeader("Origin", "https://cn.tradingview.com").
		SetHeader("Referer", "https://cn.tradingview.com/").
		SetHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0").
		//Get("https://api.ipify.org")
		Get("https://news-mediator.tradingview.com/news-flow/v2/news?filter=lang%3Azh-Hans&client=screener&streaming=false&user_prostatus=non_pro")
	if err != nil {
		logger.SugaredLogger.Error(err)
		return
	}
	logger.SugaredLogger.Debugf("value: %s", response.String())

}

func TestNtfy(t *testing.T) {

	//attach := "http://go-stock.sparkmemory.top/%E5%88%86%E6%9E%90%E6%8A%A5%E5%91%8A/%E8%B5%84%E9%87%91%E6%B5%81%E5%90%91/2025-12/AI%EF%BC%9A%E5%B8%82%E5%9C%BA%E5%88%86%E6%9E%90%E6%8A%A5%E5%91%8A-[2025.12.11_12.02.01].html"
	//post, err := resty.New().SetBaseURL("https://go-stock.sparkmemory.top:16667").R().
	//	SetHeader("Filename", "AI：市场分析报告-[2025.12.11_12.02.01].html").
	//	SetHeader("Icon", "https://go-stock.sparkmemory.top/appicon.png").
	//	SetHeader("Attach", attach).
	//	SetBody("AI：市场分析报告-[2025.12.11_12.02.01]").Post("/go-stock")
	//if err != nil {
	//	logger.SugaredLogger.Error(err)
	//	return
	//}
	//logger.SugaredLogger.Debugf("value: %s", post.String())
	logger.SugaredLogger.Debugf("value: %s", filepath.Base("https://go-stock.sparkmemory.top/%E5%88%86%E6%9E%90%E6%8A%A5%E5%91%8A/2025/12/11/%E5%B8%82%E5%9C%BA%E8%B5%84%E8%AE%AF[%E5%B8%82%E5%9C%BA%E8%B5%84%E8%AE%AF]-(2025-12-11)AI%E5%88%86%E6%9E%90%E7%BB%93%E6%9E%9C_20251211131509.html"))
	logger.SugaredLogger.Debugf("value: %s", strutil.After("/data/go-stock-site/docs/分析报告/2025/12/09/市场资讯[市场资讯]-(2025-12-09)AI分析结果.md", "/data/go-stock-site/docs/"))
}

func TestGetSecuritiesCompanyOpinion(t *testing.T) {
	res := NewMarketNewsApi().GetSecuritiesCompanyOpinion("2026-03-01", "2026-03-03")
	md := strings.Builder{}
	for _, d := range res.Data {
		md.WriteString(d.OpinionData + "\n")
	}
	logger.SugaredLogger.Debugf("%s", md.String())

}

// ==================== 市场情绪相关测试 ====================

// TestCrawlLimitUpDownData 测试涨跌停数据爬取
func TestCrawlLimitUpDownData(t *testing.T) {
	db.Init("../../data/stock.db")
	api := NewMarketNewsApi()
	data := api.crawlLimitUpDownData()

	t.Logf("========== 涨跌停数据 ==========")
	t.Logf("涨停家数: %d", data.LimitUpCount)
	t.Logf("跌停家数: %d", data.LimitDownCount)

	// 验证数据合理性
	if data.LimitUpCount == 0 && data.LimitDownCount == 0 {
		t.Log("警告: 涨跌停数据都为0，可能是非交易时间或接口失效")
	}

	// 涨停数和跌停数应该是非负数
	if data.LimitUpCount < 0 {
		t.Errorf("涨停家数不应为负数: %d", data.LimitUpCount)
	}
	if data.LimitDownCount < 0 {
		t.Errorf("跌停家数不应为负数: %d", data.LimitDownCount)
	}
}

// TestCrawlUpDownCountData 测试涨跌家数数据爬取
func TestCrawlUpDownCountData(t *testing.T) {
	db.Init("../../data/stock.db")
	api := NewMarketNewsApi()
	data := api.crawlUpDownCountData()

	t.Logf("========== 涨跌家数数据 ==========")
	t.Logf("上涨家数: %d", data.UpCount)
	t.Logf("下跌家数: %d", data.DownCount)
	t.Logf("平盘家数: %d", data.FlatCount)
	t.Logf("总计: %d", data.UpCount+data.DownCount+data.FlatCount)

	// 验证数据合理性
	total := data.UpCount + data.DownCount + data.FlatCount
	if total == 0 {
		t.Log("警告: 涨跌家数数据都为0，可能是非交易时间或接口失效")
	} else {
		upRatio := float64(data.UpCount) / float64(total) * 100
		downRatio := float64(data.DownCount) / float64(total) * 100
		t.Logf("上涨比例: %.2f%%", upRatio)
		t.Logf("下跌比例: %.2f%%", downRatio)
	}

	// 数据应该是非负数
	if data.UpCount < 0 || data.DownCount < 0 || data.FlatCount < 0 {
		t.Error("涨跌家数不应为负数")
	}
}

// TestCrawlNorthFundData 测试北向资金数据爬取
func TestCrawlNorthFundData(t *testing.T) {
	db.Init("../../data/stock.db")
	api := NewMarketNewsApi()
	data := api.crawlNorthFundData()

	t.Logf("========== 北向资金数据 ==========")
	t.Logf("北向资金净流入: %.2f 亿元", data.NetInflow)
	t.Logf("沪股通净流入: %.2f 亿元", data.SHInflow)
	t.Logf("深股通净流入: %.2f 亿元", data.SZInflow)

	// 验证数据合理性：沪股通+深股通应该接近北向总流入
	calcTotal := data.SHInflow + data.SZInflow
	t.Logf("沪股通+深股通: %.2f 亿元", calcTotal)

	// 检查数据是否都为0
	if data.NetInflow == 0 && data.SHInflow == 0 && data.SZInflow == 0 {
		t.Log("警告: 北向资金数据都为0，可能是非交易时间或接口失效")
	}
}

// TestGetMarketSentimentMultiDimensional 测试完整的市场情绪评分
func TestGetMarketSentimentMultiDimensional(t *testing.T) {
	db.Init("../../data/stock.db")
	InitAnalyzeSentiment()
	api := NewMarketNewsApi()
	result := api.GetMarketSentimentMultiDimensional()

	t.Logf("========== 市场情绪多维度评分 ==========")

	// 打印各维度详情
	if limitUpDown, ok := result["limitUpDown"].(map[string]any); ok {
		t.Logf("--- 涨跌停维度 ---")
		t.Logf("  涨停家数: %v", limitUpDown["limitUpCount"])
		t.Logf("  跌停家数: %v", limitUpDown["limitDownCount"])
		t.Logf("  维度得分: %v", limitUpDown["score"])
		t.Logf("  权重: %v", limitUpDown["weight"])

		// 验证得分范围
		if score, ok := limitUpDown["score"].(float64); ok {
			if score < -100 || score > 100 {
				t.Errorf("涨跌停维度得分超出范围 [-100, 100]: %.2f", score)
			}
		}
	}

	if upDownCount, ok := result["upDownCount"].(map[string]any); ok {
		t.Logf("--- 涨跌家数维度 ---")
		t.Logf("  上涨家数: %v", upDownCount["upCount"])
		t.Logf("  下跌家数: %v", upDownCount["downCount"])
		t.Logf("  平盘家数: %v", upDownCount["flatCount"])
		t.Logf("  涨跌比: %.4f", upDownCount["ratio"])
		t.Logf("  维度得分: %v", upDownCount["score"])
		t.Logf("  权重: %v", upDownCount["weight"])

		// 验证得分范围
		if score, ok := upDownCount["score"].(float64); ok {
			if score < -100 || score > 100 {
				t.Errorf("涨跌家数维度得分超出范围 [-100, 100]: %.2f", score)
			}
		}
	}

	if northFund, ok := result["northFund"].(map[string]any); ok {
		t.Logf("--- 北向资金维度 ---")
		t.Logf("  北向净流入: %v 亿元", northFund["netInflow"])
		t.Logf("  沪股通: %v 亿元", northFund["shInflow"])
		t.Logf("  深股通: %v 亿元", northFund["szInflow"])
		t.Logf("  维度得分: %v", northFund["score"])
		t.Logf("  权重: %v", northFund["weight"])

		// 验证得分范围
		if score, ok := northFund["score"].(float64); ok {
			if score < -100 || score > 100 {
				t.Errorf("北向资金维度得分超出范围 [-100, 100]: %.2f", score)
			}
		}
	}

	if nlpSentiment, ok := result["nlpSentiment"].(map[string]any); ok {
		t.Logf("--- NLP情感维度 ---")
		t.Logf("  原始得分: %v", nlpSentiment["score"])
		t.Logf("  归一化得分: %v", nlpSentiment["normalizedScore"])
		t.Logf("  描述: %v", nlpSentiment["description"])
		t.Logf("  权重: %v", nlpSentiment["weight"])

		// 验证归一化得分范围
		if score, ok := nlpSentiment["normalizedScore"].(float64); ok {
			if score < -100 || score > 100 {
				t.Errorf("NLP归一化得分超出范围 [-100, 100]: %.2f", score)
			}
		}
	}

	// 打印总分
	t.Logf("--- 综合评分 ---")
	if totalScore, ok := result["totalScore"].(float64); ok {
		t.Logf("  加权总分: %.2f", totalScore)
		t.Logf("  更新时间: %v", result["updateTime"])

		// 验证总分范围 -100 ~ 100
		if totalScore < -100 || totalScore > 100 {
			t.Errorf("总分超出范围 [-100, 100]: %.2f", totalScore)
		}

		// 判断市场情绪
		var sentiment string
		if totalScore >= 50 {
			sentiment = "极度乐观"
		} else if totalScore >= 20 {
			sentiment = "乐观"
		} else if totalScore >= -20 {
			sentiment = "中性"
		} else if totalScore >= -50 {
			sentiment = "悲观"
		} else {
			sentiment = "极度悲观"
		}
		t.Logf("  市场情绪: %s", sentiment)
	} else {
		t.Error("未获取到总分")
	}

	// 打印完整JSON用于调试
	jsonBytes, _ := json.MarshalIndent(result, "", "  ")
	t.Logf("完整结果JSON:\n%s", string(jsonBytes))
}
