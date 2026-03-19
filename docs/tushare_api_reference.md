# Tushare Pro 接口参考文档

> 文档生成时间：2026-03-19
> 数据来源：https://tushare.pro/document/2

---

## 目录

- [一、基础数据类](#一基础数据类)
- [二、行情数据类](#二行情数据类)
- [三、财务数据类](#三财务数据类)
- [四、市场参考数据类](#四市场参考数据类)
- [五、特色数据类](#五特色数据类)
- [六、当前代码实现对比](#六当前代码实现对比)
- [七、建议补充的接口](#七建议补充的接口)

---

## 一、基础数据类

### 1.1 股票列表 (stock_basic)

**接口：** `stock_basic`

**描述：** 获取基础信息数据，包括股票代码、名称、上市日期、退市日期等

**限量：** 每次最多返回6000行数据

**权限：** 2000积分起，每分钟请求50次

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | N | TS股票代码 |
| name | str | N | 名称 |
| market | str | N | 市场类别（主板/创业板/科创板/CDR/北交所） |
| list_status | str | N | 上市状态 L上市 D退市 P暂停上市 G过会未交易，默认是L |
| exchange | str | N | 交易所 SSE上交所 SZSE深交所 BSE北交所 |
| is_hs | str | N | 是否沪深港通标的，N否 H沪股通 S深股通 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS代码 |
| symbol | str | 股票代码 |
| name | str | 股票名称 |
| area | str | 地域 |
| industry | str | 所属行业 |
| fullname | str | 股票全称 |
| enname | str | 英文全称 |
| cnspell | str | 拼音缩写 |
| market | str | 市场类型（主板/创业板/科创板/CDR） |
| exchange | str | 交易所代码 |
| curr_type | str | 交易货币 |
| list_status | str | 上市状态 L上市 D退市 G过会未交易 P暂停上市 |
| list_date | str | 上市日期 |
| delist_date | str | 退市日期 |
| is_hs | str | 是否沪深港通标的，N否 H沪股通 S深股通 |
| act_name | str | 实控人名称 |
| act_ent_type | str | 实控人企业性质 |

**接口示例：**

```python
pro = ts.pro_api()
# 查询当前所有正常上市交易的股票列表
data = pro.stock_basic(exchange='', list_status='L', fields='ts_code,symbol,name,area,industry,list_date')
```

---

### 1.2 交易日历 (trade_cal)

**接口：** `trade_cal`

**描述：** 获取各大交易所交易日历数据，默认提取的是上交所

**权限：** 需2000积分

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| exchange | str | N | 交易所 SSE上交所,SZSE深交所,CFFEX 中金所,SHFE 上期所,CZCE 郑商所,DCE 大商所,INE 上能源 |
| start_date | str | N | 开始日期（格式：YYYYMMDD） |
| end_date | str | N | 结束日期 |
| is_open | str | N | 是否交易 '0'休市 '1'交易 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| exchange | str | 交易所 SSE上交所 SZSE深交所 |
| cal_date | str | 日历日期 |
| is_open | str | 是否交易 0休市 1交易 |
| pretrade_date | str | 上一个交易日 |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.trade_cal(exchange='', start_date='20180101', end_date='20181231')
```

---

### 1.3 指数基础信息 (index_basic)

**接口：** `index_basic`

**描述：** 获取指数基础信息

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS指数代码 |
| name | str | 指数名称 |
| market | str | 市场 |
| publisher | str | 发布方 |
| category | str | 类别 |
| base_date | str | 基期 |
| base_point | float | 基点 |
| list_date | str | 发布日期 |
| fullname | str | 指数全称 |
| index_type | str | 指数类型 |
| weight_rule | str | 加权方式 |
| desc | str | 描述 |

---

### 1.4 股票曾用名 (namechange)

**接口：** `namechange`

**描述：** 获取股票历史曾用名

---

### 1.5 沪深港通成份股 (hs_const)

**接口：** `hs_const`

**描述：** 获取沪深港通标的股票

---

## 二、行情数据类

### 2.1 日线行情 (daily)

**接口：** `daily`

**描述：** 获取股票行情数据，本接口是未复权行情，停牌期间不提供数据

**更新时间：** 交易日每天15点～16点之间入库

**权限：** 基础积分每分钟内可调取500次，每次6000条数据

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | N | 股票代码（支持多个股票同时提取，逗号分隔） |
| trade_date | str | N | 交易日期（YYYYMMDD） |
| start_date | str | N | 开始日期(YYYYMMDD) |
| end_date | str | N | 结束日期(YYYYMMDD) |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | 股票代码 |
| trade_date | str | 交易日期 |
| open | float | 开盘价 |
| high | float | 最高价 |
| low | float | 最低价 |
| close | float | 收盘价 |
| pre_close | float | 昨收价【除权价】 |
| change | float | 涨跌额 |
| pct_chg | float | 涨跌幅（%） |
| vol | float | 成交量（手） |
| amount | float | 成交额（千元） |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.daily(ts_code='000001.SZ', start_date='20180701', end_date='20180718')
# 多个股票
df = pro.daily(ts_code='000001.SZ,600000.SH', start_date='20180701', end_date='20180718')
# 通过日期取历史某一天的全部历史
df = pro.daily(trade_date='20180810')
```

---

### 2.2 每日指标 (daily_basic)

**接口：** `daily_basic`

**描述：** 获取全部股票每日重要的基本面指标，可用于选股分析、报表展示等

**更新时间：** 交易日每日15点～17点之间

**权限：** 至少2000积分才可以调取，5000积分无总量限制

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | Y | 股票代码（二选一） |
| trade_date | str | N | 交易日期（二选一） |
| start_date | str | N | 开始日期(YYYYMMDD) |
| end_date | str | N | 结束日期(YYYYMMDD) |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS股票代码 |
| trade_date | str | 交易日期 |
| close | float | 当日收盘价 |
| turnover_rate | float | 换手率（%） |
| turnover_rate_f | float | 换手率（自由流通股） |
| volume_ratio | float | 量比 |
| pe | float | 市盈率（总市值/净利润，亏损的PE为空） |
| pe_ttm | float | 市盈率（TTM，亏损的PE为空） |
| pb | float | 市净率（总市值/净资产） |
| ps | float | 市销率 |
| ps_ttm | float | 市销率（TTM） |
| dv_ratio | float | 股息率（%） |
| dv_ttm | float | 股息率（TTM）（%） |
| total_share | float | 总股本（万股） |
| float_share | float | 流通股本（万股） |
| free_share | float | 自由流通股本（万） |
| total_mv | float | 总市值（万元） |
| circ_mv | float | 流通市值（万元） |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.daily_basic(ts_code='', trade_date='20180726', fields='ts_code,trade_date,turnover_rate,volume_ratio,pe,pb')
```

---

### 2.3 周线行情 (weekly)

**接口：** `weekly`

**描述：** 获取A股周线数据

**限量：** 单次最大4500行

**权限：** 用户需要至少2000积分

---

### 2.4 月线行情 (monthly)

**接口：** `monthly`

**描述：** 获取A股月线数据

**限量：** 单次最大4500行

**权限：** 用户需要至少2000积分

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | 股票代码 |
| trade_date | str | 交易日期 |
| close | float | 月收盘价 |
| open | float | 月开盘价 |
| high | float | 月最高价 |
| low | float | 月最低价 |
| pre_close | float | 上月收盘价 |
| change | float | 月涨跌额 |
| pct_chg | float | 月涨跌幅 |
| vol | float | 月成交量 |
| amount | float | 月成交额 |

---

### 2.5 复权因子 (adj_factor)

**接口：** `adj_factor`

**描述：** 获取股票复权因子，可用于计算复权价格

---

### 2.6 通用行情接口 (pro_bar)

**接口：** `pro_bar`

**描述：** 复权行情通过通用行情接口实现，支持复权、分钟、周月线

**复权说明：**

| 类型 | 算法 | 参数标识 |
| --- | --- | --- |
| 不复权 | 无 | 空或None |
| 前复权 | 当日收盘价 × 当日复权因子 / 最新复权因子 | qfq |
| 后复权 | 当日收盘价 × 当日复权因子 | hfq |

**接口参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | Y | 证券代码 |
| start_date | str | N | 开始日期（格式：YYYYMMDD） |
| end_date | str | N | 结束日期（格式：YYYYMMDD） |
| asset | str | Y | 资产类别：E股票 I沪深指数 C数字货币 FT期货 FD基金 O期权，默认E |
| adj | str | N | 复权类型：None未复权 qfq前复权 hfq后复权，默认None |
| freq | str | Y | 数据频度：1MIN表示1分钟（1/5/15/30/60分钟） D日线，默认D |
| ma | list | N | 均线，支持任意周期的均价和均量 |

**接口示例：**

```python
# 日线复权
df = ts.pro_bar(ts_code='000001.SZ', adj='qfq', start_date='20180101', end_date='20181011')
# 周线复权
df = ts.pro_bar(ts_code='000001.SZ', freq='W', adj='qfq', start_date='20180101', end_date='20181011')
# 月线复权
df = ts.pro_bar(ts_code='000001.SZ', freq='M', adj='qfq', start_date='20180101', end_date='20181011')
```

---

### 2.7 港股日线 (hk_daily)

**接口：** `hk_daily`

**描述：** 获取港股日线行情

---

### 2.8 美股日线 (us_daily)

**接口：** `us_daily`

**描述：** 获取美股日线行情

---

## 三、财务数据类

### 3.1 利润表 (income)

**接口：** `income`

**描述：** 获取上市公司财务利润表数据

**权限：** 用户需要至少2000积分才可以调取

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | Y | 股票代码 |
| ann_date | str | N | 公告日期（YYYYMMDD格式） |
| f_ann_date | str | N | 实际公告日期 |
| start_date | str | N | 公告日开始日期 |
| end_date | str | N | 公告日结束日期 |
| period | str | N | 报告期(每个季度最后一天的日期) |
| report_type | str | N | 报告类型 |
| comp_type | str | N | 公司类型（1一般工商业2银行3保险4证券） |

**主要输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS代码 |
| ann_date | str | 公告日期 |
| f_ann_date | str | 实际公告日期 |
| end_date | str | 报告期 |
| report_type | str | 报告类型 |
| comp_type | str | 公司类型 |
| basic_eps | float | 基本每股收益 |
| diluted_eps | float | 稀释每股收益 |
| total_revenue | float | 营业总收入 |
| revenue | float | 营业收入 |
| total_cogs | float | 营业总成本 |
| oper_cost | float | 营业成本 |
| sell_exp | float | 销售费用 |
| admin_exp | float | 管理费用 |
| fin_exp | float | 财务费用 |
| operate_profit | float | 营业利润 |
| total_profit | float | 利润总额 |
| income_tax | float | 所得税费用 |
| n_income | float | 净利润(含少数股东损益) |
| n_income_attr_p | float | 净利润(不含少数股东损益) |
| minority_gain | float | 少数股东损益 |
| ebit | float | 息税前利润 |
| ebitda | float | 息税折旧摊销前利润 |
| rd_exp | float | 研发费用 |

**报表类型说明：**

| 代码 | 类型 | 说明 |
| --- | --- | --- |
| 1 | 合并报表 | 上市公司最新报表（默认） |
| 2 | 单季合并 | 单一季度的合并报表 |
| 3 | 调整单季合并表 | 调整后的单季合并报表 |
| 4 | 调整合并报表 | 本年度公布上年同期的财务报表数据 |
| 5 | 调整前合并报表 | 数据发生变更，将原数据进行保留 |
| 6 | 母公司报表 | 该公司母公司的财务报表数据 |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.income(ts_code='600000.SH', start_date='20180101', end_date='20180730', fields='ts_code,ann_date,f_ann_date,end_date,report_type,comp_type,basic_eps,diluted_eps')
```

---

### 3.2 资产负债表 (balancesheet)

**接口：** `balancesheet`

**描述：** 获取上市公司资产负债表

**权限：** 用户需要至少2000积分才可以调取

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | Y | 股票代码 |
| ann_date | str | N | 公告日期(YYYYMMDD格式) |
| start_date | str | N | 公告日开始日期 |
| end_date | str | N | 公告日结束日期 |
| period | str | N | 报告期 |
| report_type | str | N | 报告类型 |
| comp_type | str | N | 公司类型：1一般工商业 2银行 3保险 4证券 |

**主要输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS股票代码 |
| ann_date | str | 公告日期 |
| end_date | str | 报告期 |
| total_share | float | 期末总股本 |
| cap_rese | float | 资本公积金 |
| undistr_porfit | float | 未分配利润 |
| surplus_rese | float | 盈余公积金 |
| money_cap | float | 货币资金 |
| trad_asset | float | 交易性金融资产 |
| notes_receiv | float | 应收票据 |
| accounts_receiv | float | 应收账款 |
| inventories | float | 存货 |
| total_cur_assets | float | 流动资产合计 |
| fix_assets | float | 固定资产 |
| intan_assets | float | 无形资产 |
| goodwill | float | 商誉 |
| total_nca | float | 非流动资产合计 |
| total_assets | float | 资产总计 |
| st_borr | float | 短期借款 |
| lt_borr | float | 长期借款 |
| total_cur_liab | float | 流动负债合计 |
| total_ncl | float | 非流动负债合计 |
| total_liab | float | 负债合计 |
| total_hldr_eqy_exc_min_int | float | 股东权益合计(不含少数股东权益) |
| total_hldr_eqy_inc_min_int | float | 股东权益合计(含少数股东权益) |
| total_liab_hldr_eqy | float | 负债及股东权益总计 |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.balancesheet(ts_code='600000.SH', start_date='20180101', end_date='20180730')
```

---

### 3.3 现金流量表 (cashflow)

**接口：** `cashflow`

**描述：** 获取上市公司现金流量表

**权限：** 用户需要至少2000积分才可以调取

**主要输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS代码 |
| ann_date | str | 公告日期 |
| end_date | str | 报告期 |
| n_cashflow_act | float | 经营活动产生的现金流量净额 |
| n_cashflow_inv_act | float | 投资活动产生的现金流量净额 |
| n_cash_flows_fnc_act | float | 筹资活动产生的现金流量净额 |
| c_fr_sale_sg | float | 销售商品、提供劳务收到的现金 |
| recv_other_others | float | 收到其他与经营活动有关的现金 |
| pay_for_tax | float | 支付的各项税费 |
| n_incr_cash_cash_equ | float | 现金及现金等价物净增加额 |

---

### 3.4 财务指标数据 (fina_indicator)

**接口：** `fina_indicator`

**描述：** 获取上市公司财务指标数据

**权限：** 用户需要至少2000积分才可以调取

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | Y | TS股票代码 |
| ann_date | str | N | 公告日期 |
| start_date | str | N | 报告期开始日期 |
| end_date | str | N | 报告期结束日期 |
| period | str | N | 报告期 |

**主要输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS代码 |
| ann_date | str | 公告日期 |
| end_date | str | 报告期 |
| eps | float | 基本每股收益 |
| dt_eps | float | 稀释每股收益 |
| total_revenue_ps | float | 每股营业总收入 |
| revenue_ps | float | 每股营业收入 |
| bps | float | 每股净资产 |
| ocfps | float | 每股经营活动产生的现金流量净额 |
| cfps | float | 每股现金流量净额 |
| netprofit_margin | float | 销售净利率 |
| grossprofit_margin | float | 销售毛利率 |
| roe | float | 净资产收益率 |
| roe_waa | float | 加权平均净资产收益率 |
| roe_dt | float | 净资产收益率(扣除非经常损益) |
| roa | float | 总资产报酬率 |
| npta | float | 总资产净利润 |
| roic | float | 投入资本回报率 |
| roe_yearly | float | 年化净资产收益率 |
| roa_yearly | float | 年化总资产报酬率 |
| debt_to_assets | float | 资产负债率 |
| assets_to_eqt | float | 权益乘数 |
| current_ratio | float | 流动比率 |
| quick_ratio | float | 速动比率 |
| cash_ratio | float | 保守速动比率 |
| inv_turn | float | 存货周转率 |
| ar_turn | float | 应收账款周转率 |
| ca_turn | float | 流动资产周转率 |
| fa_turn | float | 固定资产周转率 |
| assets_turn | float | 总资产周转率 |
| ebit | float | 息税前利润 |
| ebitda | float | 息税折旧摊销前利润 |
| fcff | float | 企业自由现金流量 |
| fcfe | float | 股权自由现金流量 |
| basic_eps_yoy | float | 基本每股收益同比增长率(%) |
| dt_eps_yoy | float | 稀释每股收益同比增长率(%) |
| cfps_yoy | float | 每股经营活动产生的现金流量净额同比增长率(%) |
| op_yoy | float | 营业利润同比增长率(%) |
| ebt_yoy | float | 利润总额同比增长率(%) |
| netprofit_yoy | float | 归属母公司股东的净利润同比增长率(%) |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.fina_indicator(ts_code='600000.SH', start_date='20180101', end_date='20181231')
```

---

### 3.5 业绩快报 (express)

**接口：** `express`

**描述：** 获取上市公司业绩快报

**权限：** 用户需要至少2000积分才可以调取

**主要输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS股票代码 |
| ann_date | str | 公告日期 |
| end_date | str | 报告期 |
| revenue | float | 营业收入(元) |
| operate_profit | float | 营业利润(元) |
| total_profit | float | 利润总额(元) |
| n_income | float | 净利润(元) |
| total_assets | float | 总资产(元) |
| total_hldr_eqy_exc_min_int | float | 股东权益合计(不含少数股东权益)(元) |
| diluted_eps | float | 每股收益(摊薄)(元) |
| diluted_roe | float | 净资产收益率(摊薄)(%) |
| yoy_net_profit | float | 去年同期修正后净利润 |
| bps | float | 每股净资产 |
| yoy_sales | float | 同比增长率:营业收入 |
| yoy_op | float | 同比增长率:营业利润 |
| yoy_tp | float | 同比增长率:利润总额 |
| yoy_dedu_np | float | 同比增长率:归属母公司股东的净利润 |
| yoy_eps | float | 同比增长率:基本每股收益 |
| yoy_roe | float | 同比增减:加权平均净资产收益率 |
| growth_assets | float | 比年初增长率:总资产 |
| yoy_equity | float | 比年初增长率:归属母公司的股东权益 |

---

### 3.6 分红送股 (dividend)

**接口：** `dividend`

**描述：** 分红送股数据

**权限：** 用户需要至少2000积分才可以调取

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | N | TS代码 |
| ann_date | str | N | 公告日 |
| record_date | str | N | 股权登记日期 |
| ex_date | str | N | 除权除息日 |
| imp_ann_date | str | N | 实施公告日 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS代码 |
| end_date | str | 分红年度 |
| ann_date | str | 预案公告日 |
| div_proc | str | 实施进度 |
| stk_div | float | 每股送转 |
| stk_bo_rate | float | 每股送股比例 |
| stk_co_rate | float | 每股转增比例 |
| cash_div | float | 每股分红（税后） |
| cash_div_tax | float | 每股分红（税前） |
| record_date | str | 股权登记日 |
| ex_date | str | 除权除息日 |
| pay_date | str | 派息日 |
| div_listdate | str | 红股上市日 |
| imp_ann_date | str | 实施公告日 |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.dividend(ts_code='600848.SH', fields='ts_code,div_proc,stk_div,record_date,ex_date')
```

---

## 四、市场参考数据类

### 4.1 前十大股东 (top10_holders)

**接口：** `top10_holders`

**描述：** 获取上市公司前十大股东数据

**权限：** 需2000积分以上才可以调取

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | Y | TS代码 |
| period | str | N | 报告期（YYYYMMDD格式） |
| ann_date | str | N | 公告日期 |
| start_date | str | N | 报告期开始日期 |
| end_date | str | N | 报告期结束日期 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS股票代码 |
| ann_date | str | 公告日期 |
| end_date | str | 报告期 |
| holder_name | str | 股东名称 |
| hold_amount | float | 持有数量（股） |
| hold_ratio | float | 占总股本比例(%) |
| hold_float_ratio | float | 占流通股本比例(%) |
| hold_change | float | 持股变动 |
| holder_type | str | 股东类型 |

**接口示例：**

```python
pro = ts.pro_api()
df = pro.top10_holders(ts_code='600000.SH', start_date='20170101', end_date='20171231')
```

---

### 4.2 十大流通股东 (top10_floatholders)

**接口：** `top10_floatholders`

**描述：** 获取上市公司前十大流通股东数据

---

### 4.3 股东人数 (stk_holdernumber)

**接口：** `stk_holdernumber`

**描述：** 获取上市公司股东人数变化数据

---

### 4.4 股权质押统计 (pledge_stat)

**接口：** `pledge_stat`

**描述：** 获取股票质押统计数据

**权限：** 用户需要至少500积分才可以调取

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | N | 股票代码 |
| end_date | str | N | 截止日期 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS代码 |
| end_date | str | 截止日期 |
| pledge_count | int | 质押次数 |
| unrest_pledge | float | 无限售股质押数量（万） |
| rest_pledge | float | 限售股份质押数量（万） |
| total_share | float | 总股本 |
| pledge_ratio | float | 质押比例 |

---

### 4.5 公募基金持仓 (fund_portfolio)

**接口：** `fund_portfolio`

**描述：** 获取公募基金持仓数据，季度更新

**权限：** 5000积分以上每分钟请求200次，8000积分以上每分钟请求500次

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| ts_code | str | N | 基金代码 |
| symbol | str | N | 股票代码 |
| ann_date | str | N | 公告日期 |
| period | str | N | 季度 |
| start_date | str | N | 报告期开始日期 |
| end_date | str | N | 报告期结束日期 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| ts_code | str | TS基金代码 |
| ann_date | str | 公告日期 |
| end_date | str | 截止日期 |
| symbol | str | 股票代码 |
| mkv | float | 持有股票市值(元) |
| amount | float | 持有股票数量（股） |
| stk_mkv_ratio | float | 占股票市值比 |
| stk_float_ratio | float | 占流通股本比例 |

---

## 五、特色数据类

### 5.1 概念板块 (concept)

**接口：** `concept`

**描述：** 获取概念板块分类

---

### 5.2 概念成分股 (concept_detail)

**接口：** `concept_detail`

**描述：** 获取概念板块成分股

---

### 5.3 行业分类 (industry)

**接口：** `industry`

**描述：** 获取行业分类数据

---

### 5.4 停复牌信息 (suspend)

**接口：** `suspend`

**描述：** 获取股票停复牌信息

---

### 5.5 股票历史列表 (bak_basic)

**接口：** `bak_basic`

**描述：** 获取备用基础列表，数据从2016年开始

**限量：** 单次最大7000条

**权限：** 正式权限需要5000积分

**输入参数：**

| 名称 | 类型 | 必选 | 描述 |
| --- | --- | --- | --- |
| trade_date | str | N | 交易日期 |
| ts_code | str | N | 股票代码 |

**输出参数：**

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| trade_date | str | 交易日期 |
| ts_code | str | TS股票代码 |
| name | str | 股票名称 |
| industry | str | 行业 |
| area | str | 地域 |
| pe | float | 市盈率（动） |
| float_share | float | 流通股本（亿） |
| total_share | float | 总股本（亿） |
| total_assets | float | 总资产（亿） |
| liquid_assets | float | 流动资产（亿） |
| fixed_assets | float | 固定资产（亿） |
| reserved | float | 公积金 |
| reserved_pershare | float | 每股公积金 |
| eps | float | 每股收益 |
| bvps | float | 每股净资产 |
| pb | float | 市净率 |
| list_date | str | 上市日期 |
| undp | float | 未分配利润 |
| per_undp | float | 每股未分配利润 |
| rev_yoy | float | 收入同比（%） |
| profit_yoy | float | 利润同比（%） |
| gpr | float | 毛利率（%） |
| npr | float | 净利润率（%） |
| holder_num | int | 股东人数 |

---

## 六、当前代码实现对比

### 6.1 已实现的 Tushare 接口

| 接口名称 | 接口代码 | 实现位置 | 说明 |
|---------|---------|---------|------|
| 股票列表 | `stock_basic` | `main.go` / `stock_data_api.go` | 股票基础信息存储到数据库 |
| 指数基础信息 | `index_basic` | `stock_data_api.go` | 指数基础信息 |
| A股日线行情 | `daily` | `tushare_data_api.go` | 日线行情数据 |
| 港股日线行情 | `hk_daily` | `tushare_data_api.go` | 港股日线行情 |
| 美股日线行情 | `us_daily` | `tushare_data_api.go` | 美股日线行情 |

### 6.2 其他数据源

| 数据类型 | 数据源 | 实现位置 |
|---------|--------|---------|
| 实时行情 | 新浪财经 | `stock_data_api.go` |
| 实时行情 | 腾讯财经 | `stock_data_api.go` |
| 资金流向 | 东方财富 | `stock_data_api.go` |
| 龙虎榜 | 东方财富 | `stock_data_api.go` |
| 财务数据 | 东方财富 | `stock_data_api.go` |
| 股东人数 | 东方财富 | `stock_data_api.go` |
| 热门股票 | 雪球 | `crawler_api.go` |

### 6.3 未实现的重要接口

| 接口名称 | 接口代码 | 重要性 | 说明 |
|---------|---------|--------|------|
| 每日指标 | `daily_basic` | 🔴 高 | PE/PB/市值等估值指标 |
| 财务指标 | `fina_indicator` | 🔴 高 | ROE/毛利率等财务指标 |
| 利润表 | `income` | 🔴 高 | 利润表数据 |
| 资产负债表 | `balancesheet` | 🔴 高 | 资产负债表数据 |
| 现金流量表 | `cashflow` | 🔴 高 | 现金流量表数据 |
| 分红送股 | `dividend` | 🔴 高 | 分红数据 |
| 交易日历 | `trade_cal` | 🟡 中 | 交易日判断 |
| 前十大股东 | `top10_holders` | 🟡 中 | 股东结构分析 |
| 复权因子 | `adj_factor` | 🟡 中 | 复权计算 |
| 业绩快报 | `express` | 🟡 中 | 业绩快报 |
| 股权质押统计 | `pledge_stat` | 🟡 中 | 质押风险分析 |
| 概念板块 | `concept` | 🟢 低 | 概念板块分析 |
| 周月线 | `weekly`/`monthly` | 🟢 低 | 周月线分析 |

---

## 七、建议补充的接口

### 7.1 高优先级（核心分析数据）

| 接口 | 理由 | 建议用途 |
|-----|------|--------|
| `daily_basic` | PE/PB/市值等估值指标，选股必备 | 估值分析、选股筛选 |
| `fina_indicator` | ROE/毛利率等财务指标，基本面分析核心 | 财务健康度评估 |
| `income` | 利润表数据，财务分析基础 | 盈利能力分析 |
| `balancesheet` | 资产负债表，财务健康度分析 | 资产负债结构分析 |
| `cashflow` | 现金流量表，现金流分析 | 现金流健康度 |
| `dividend` | 分红数据，股息率计算 | 分红收益分析 |

### 7.2 中优先级（增强分析）

| 接口 | 理由 | 建议用途 |
|-----|------|--------|
| `top10_holders` | 股东结构分析 | 股东变化追踪 |
| `trade_cal` | 交易日判断，定时任务依赖 | 判断是否交易日 |
| `adj_factor` | 复权计算 | 准确复权价格 |
| `express` | 业绩快报，提前预判业绩 | 业绩预期分析 |
| `pledge_stat` | 股权质押风险分析 | 风险预警 |

### 7.3 低优先级（补充数据）

| 接口 | 理由 | 建议用途 |
|-----|------|--------|
| `concept` / `concept_detail` | 概念板块分析 | 板块轮动分析 |
| `weekly` / `monthly` | 周月线分析 | 中长期趋势 |
| `hs_const` | 沪深港通成分股 | 北向资金标的 |
| `fund_portfolio` | 基金持仓分析 | 机构持仓追踪 |

---

## 附录：Tushare 代码规范

### 股票代码格式

| 交易所名称 | 交易所代码 | 股票代码后缀 | 示例 |
| --- | --- | --- | --- |
| 上海证券交易所 | SSE | .SH | 600000.SH(股票) 000001.SH(指数) |
| 深圳证券交易所 | SZSE | .SZ | 000001.SZ(股票) 399005.SZ(指数) |
| 北京证券交易所 | BSE | .BJ | 9开头的股票 |
| 香港证券交易所 | HKEX | .HK | 00001.HK |

### 积分说明

| 积分等级 | 权限说明 |
|---------|--------|
| 500积分 | 基础接口权限 |
| 2000积分 | 大部分接口权限 |
| 5000积分 | 高级接口权限，无总量限制 |
| 8000积分 | 最高权限 |

---

*文档结束*
|