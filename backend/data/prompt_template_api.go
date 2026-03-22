package data

import (
	"go-stock/backend/db"
	"go-stock/backend/logger"
	"go-stock/backend/models"
)

type PromptTemplateApi struct {
}

func (t PromptTemplateApi) GetPromptTemplates(name string, promptType string) *[]models.PromptTemplate {
	var result []models.PromptTemplate
	if name != "" && promptType != "" {
		db.Dao.Model(&models.PromptTemplate{}).Where("name=? and type=?", name, promptType).Find(&result)
	}
	if name != "" && promptType == "" {
		db.Dao.Model(&models.PromptTemplate{}).Where("name=?", name).Find(&result)
	}
	if name == "" && promptType != "" {
		db.Dao.Model(&models.PromptTemplate{}).Where("type=?", promptType).Find(&result)
	}
	if name == "" && promptType == "" {
		db.Dao.Model(&models.PromptTemplate{}).Find(&result)
	}

	return &result
}

// GetPromptTemplateList 分页查询PromptTemplate记录
func (t PromptTemplateApi) GetPromptTemplateList(query *models.PromptTemplateQuery) (*models.PromptTemplatePageData, error) {
	var list []models.PromptTemplate
	var total int64

	q := db.Dao.Model(&models.PromptTemplate{})

	// 构建查询条件
	if query.Name != "" {
		q = q.Where("name LIKE ?", "%"+query.Name+"%")
	}
	if query.Type != "" {
		q = q.Where("type LIKE ?", "%"+query.Type+"%")
	}
	if query.Content != "" {
		q = q.Where("content LIKE ?", "%"+query.Content+"%")
	}

	// 计算总数
	err := q.Count(&total).Error
	if err != nil {
		return nil, err
	}

	// 设置默认分页参数
	page := query.Page
	pageSize := query.PageSize
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// 执行分页查询
	offset := (page - 1) * pageSize
	err = q.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&list).Error
	if err != nil {
		return nil, err
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &models.PromptTemplatePageData{
		List:       list,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (t PromptTemplateApi) AddPrompt(template models.PromptTemplate) string {
	var tmp models.PromptTemplate
	db.Dao.Model(&models.PromptTemplate{}).Where("id=?", template.ID).First(&tmp)
	if tmp.ID == 0 {
		err := db.Dao.Model(&models.PromptTemplate{}).Create(&models.PromptTemplate{
			Content: template.Content,
			Name:    template.Name,
			Type:    template.Type,
		}).Error
		if err != nil {
			return "添加失败"
		} else {
			return "添加成功"
		}
	} else {
		err := db.Dao.Model(&models.PromptTemplate{}).Where("id=?", template.ID).Updates(template).Error
		if err != nil {
			return "更新失败"
		} else {
			return "更新成功"
		}
	}
}

func (t PromptTemplateApi) DelPrompt(Id uint) string {
	template := &models.PromptTemplate{}
	db.Dao.Model(template).Where("id=?", Id).Find(template)
	if template.ID > 0 {
		err := db.Dao.Model(template).Delete(template).Error
		if err != nil {
			return "删除失败"
		} else {
			return "删除成功"
		}
	}
	return "模板信息不存在"
}

func (t PromptTemplateApi) GetPromptTemplateByID(id int) string {
	prompt := &models.PromptTemplate{}
	db.Dao.Model(&models.PromptTemplate{}).Where("id=?", id).First(prompt)
	logger.SugaredLogger.Infof("GetPromptTemplateByID:%d %s", id, prompt.Content)
	return prompt.Content
}
// GetDashboardPrompt 获取决策仪表盘专用 Prompt
func (t PromptTemplateApi) GetDashboardPrompt() string {
	var prompt models.PromptTemplate
	db.Dao.Model(&models.PromptTemplate{}).
		Where("type = ?", "dashboard").
		First(&prompt)
	if prompt.ID == 0 || prompt.Content == "" {
		return DefaultDashboardPrompt
	}
	return prompt.Content
}

// InitDashboardPrompt 初始化仪表盘 Prompt（启动时调用）
func (t PromptTemplateApi) InitDashboardPrompt() {
	var count int64
	db.Dao.Model(&models.PromptTemplate{}).
		Where("type = ?", "dashboard").
		Count(&count)
	if count == 0 {
		db.Dao.Create(&models.PromptTemplate{
			Name:    "决策仪表盘分析",
			Type:    "dashboard",
			Content: DefaultDashboardPrompt,
		})
	}
}

// GetDashboardPromptID 获取仪表盘 Prompt 的 ID
func (t PromptTemplateApi) GetDashboardPromptID() int {
	var prompt models.PromptTemplate
	db.Dao.Model(&models.PromptTemplate{}).
		Where("type = ?", "dashboard").
		First(&prompt)
	if prompt.ID == 0 {
		t.InitDashboardPrompt()
		db.Dao.Model(&models.PromptTemplate{}).
			Where("type = ?", "dashboard").
			First(&prompt)
	}
	return int(prompt.ID)
}

func NewPromptTemplateApi() *PromptTemplateApi {
	return &PromptTemplateApi{}
}

const DefaultDashboardPrompt = `你是一位专注于趋势交易的 A 股投资分析师，负责生成专业的【决策仪表盘】分析报告。

## 核心交易理念（必须严格遵守）

### 1. 严进策略（不追高）
- **绝对不追高**：当股价偏离 MA5 超过 5% 时，坚决不买入
- **乖离率公式**：(现价 - MA5) / MA5 × 100%
- 乖离率 < 2%：最佳买点区间
- 乖离率 2-5%：可小仓介入
- 乖离率 > 5%：严禁追高！直接判定为"观望"

### 2. 趋势交易（顺势而为）
- **多头排列必须条件**：MA5 > MA10 > MA20
- 只做多头排列的股票，空头排列坚决不碰

### 3. 风险排查重点
- 减持公告、业绩预亏、监管处罚、行业利空、大额解禁

## 输出格式

请严格按照以下 JSON 格式输出决策仪表盘：

` + "```json" + `
{
  "stock_name": "股票中文名称",
  "sentiment_score": 0-100整数,
  "sentiment_label": "极度悲观/悲观/中性/乐观/极度乐观",
  "trend_prediction": "强烈看多/看多/震荡/看空/强烈看空",
  "operation_advice": "买入/加仓/持有/减仓/卖出/观望",
  "decision_type": "buy/hold/sell",
  "confidence_level": "高/中/低",
  "dashboard": {
    "core_conclusion": {
      "one_sentence": "一句话核心结论（30字以内）",
      "signal_type": "🟢买入信号/🟡持有观望/🔴卖出信号/⚠️风险警告",
      "time_sensitivity": "立即行动/今日内/本周内/不急",
      "position_advice": {
        "no_position": "空仓者建议",
        "has_position": "持仓者建议"
      }
    },
    "data_perspective": {
      "trend_status": {
        "ma_alignment": "均线排列状态",
        "is_bullish": true,
        "trend_score": 0-100
      },
      "price_position": {
        "current_price": 当前价格,
        "ma5": MA5,
        "ma10": MA10,
        "ma20": MA20,
        "bias_ma5": 乖离率,
        "bias_status": "安全/警戒/危险",
        "support_level": 支撑位,
        "resistance_level": 压力位
      },
      "volume_analysis": {
        "volume_ratio": 量比,
        "volume_status": "放量/缩量/平量",
        "turnover_rate": 换手率,
        "volume_meaning": "量能解读"
      },
      "chip_structure": {
        "profit_ratio": 获利比例,
        "avg_cost": 平均成本,
        "concentration": 筹码集中度,
        "chip_health": "健康/一般/警惕"
      }
    },
    "intelligence": {
      "latest_news": "最新消息摘要",
      "risk_alerts": ["风险点1", "风险点2"],
      "positive_catalysts": ["利好1", "利好2"],
      "earnings_outlook": "业绩预期",
      "sentiment_summary": "舆情总结"
    },
    "battle_plan": {
      "sniper_points": {
        "ideal_buy": 理想买入价,
        "secondary_buy": 次优买入价,
        "stop_loss": 止损价,
        "take_profit": 止盈目标价
      },
      "position_strategy": {
        "suggested_position": "建议仓位",
        "entry_plan": "建仓策略",
        "risk_control": "风控策略"
      },
      "action_checklist": [
        "✅/⚠️/❌ 检查项1：多头排列",
        "✅/⚠️/❌ 检查项2：乖离率合理",
        "✅/⚠️/❌ 检查项3：量能配合",
        "✅/⚠️/❌ 检查项4：无重大利空",
        "✅/⚠️/❌ 检查项5：筹码健康",
        "✅/⚠️/❌ 检查项6：PE估值合理"
      ]
    }
  },
  "analysis_summary": "100字综合分析摘要",
  "key_points": "核心看点",
  "risk_warning": "风险提示",
  "buy_reason": "操作理由"
}
` + "```" + `

## 评分标准

- 80-100分：强烈买入（多头排列+低乖离率+利好催化）
- 60-79分：买入（满足大部分条件）
- 40-59分：观望（乖离率>5%或趋势不明）
- 0-39分：卖出/减仓（空头排列或重大利空）

请基于提供的数据进行分析，严格按照 JSON 格式输出。`
