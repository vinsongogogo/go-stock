import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Upload, Download } from 'lucide-react';
import { GetConfig, UpdateConfig, ExportConfig, CheckSponsorCode, SendDingDingMessageByType } from '../../../wailsjs/go/main/App';
import { data } from '../../../wailsjs/go/models';
import { useLayoutShell } from '../context/LayoutShellContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from './ui/utils';

export function Settings() {
  const { compactLayout } = useLayoutShell();
  const { isDark, setIsDark } = useTheme();
  // 基础设置
  const [configId, setConfigId] = useState<number>(1);
  const [tushareToken, setTushareToken] = useState('');
  const [updateBasicInfoOnStart, setUpdateBasicInfoOnStart] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(1);
  const [browserPath, setBrowserPath] = useState('');
  const [enableFund, setEnableFund] = useState(false);
  const [enableAgent, setEnableAgent] = useState(false);
  const [qgqpBId, setQgqpBId] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');

  // 通知设置
  const [dingPushEnable, setDingPushEnable] = useState(false);
  const [dingRobot, setDingRobot] = useState('');
  const [localPushEnable, setLocalPushEnable] = useState(true);
  const [enableDanmu, setEnableDanmu] = useState(false);
  const [enableNews, setEnableNews] = useState(false);
  const [enablePushNews, setEnablePushNews] = useState(true);
  const [enableOnlyPushRedNews, setEnableOnlyPushRedNews] = useState(true);

  // AI 设置
  const [openAiEnable, setOpenAiEnable] = useState(false);
  const [crawlTimeOut, setCrawlTimeOut] = useState(30);
  const [kDays, setKDays] = useState(30);
  const [httpProxyEnabled, setHttpProxyEnabled] = useState(false);
  const [httpProxy, setHttpProxy] = useState('');
  const [prompt, setPrompt] = useState('');
  const [questionTemplate, setQuestionTemplate] = useState('{{stockName}}分析和总结');
  const [aiConfigs, setAiConfigs] = useState<data.AIConfig[]>([]);

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  // 消息提示函数
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 初始化加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await GetConfig();
      
      // 基础设置映射
      setConfigId(res.ID);
      setTushareToken(res.tushareToken || '');
      setUpdateBasicInfoOnStart(res.updateBasicInfoOnStart || false);
      setRefreshInterval(res.refreshInterval || 1);
      setIsDark(res.darkTheme ?? true);
      setBrowserPath(res.browserPath || '');
      setEnableFund(res.enableFund || false);
      setEnableAgent(res.enableAgent || false);
      setQgqpBId(res.qgqpBId || '');
      setSponsorCode(res.sponsorCode || '');
      
      // 通知设置映射
      setDingPushEnable(res.dingPushEnable || false);
      setDingRobot(res.dingRobot || '');
      setLocalPushEnable(res.localPushEnable ?? true);
      setEnableDanmu(res.enableDanmu || false);
      setEnableNews(res.enableNews || false);
      setEnablePushNews(res.enablePushNews ?? true);
      setEnableOnlyPushRedNews(res.enableOnlyPushRedNews ?? true);
      
      // AI 设置映射
      setOpenAiEnable(res.openAiEnable || false);
      setCrawlTimeOut(res.crawlTimeOut || 30);
      setKDays(res.kDays || 30);
      setHttpProxyEnabled(res.httpProxyEnabled || false);
      setHttpProxy(res.httpProxy || '');
      setPrompt(res.prompt || '');
      setQuestionTemplate(res.questionTemplate || '{{stockName}}分析和总结');
      setAiConfigs(res.aiConfigs || []);
      
    } catch (error) {
      console.error('加载配置失败:', error);
      showMessage('error', '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // 确保 aiConfigs 都是正确的类实例
      const validAiConfigs = aiConfigs.map(config => {
        if (config instanceof data.AIConfig) {
          return config;
        }
        return new data.AIConfig(config);
      });
      
      // 构建 SettingConfig 对象
      const config = new data.SettingConfig({
        ID: configId,
        tushareToken,
        localPushEnable,
        dingPushEnable,
        dingRobot,
        updateBasicInfoOnStart,
        refreshInterval,
        openAiEnable,
        prompt,
        questionTemplate,
        crawlTimeOut,
        kDays,
        enableDanmu,
        browserPath,
        enableNews,
        darkTheme: isDark,
        enableFund,
        enablePushNews,
        enableOnlyPushRedNews,
        sponsorCode,
        httpProxy,
        httpProxyEnabled,
        enableAgent,
        qgqpBId,
        aiConfigs: validAiConfigs,
      });
      
      // 如果有赞助码，先验证
      if (sponsorCode) {
        const verifyResult = await CheckSponsorCode(sponsorCode);
        if (!verifyResult.code) {
          showMessage('error', verifyResult.msg);
          setLoading(false);
          return;
        }
      }
      
      // 调用更新 API
      const result = await UpdateConfig(config);
      showMessage('success', result);
      
    } catch (error) {
      console.error('保存配置失败:', error);
      showMessage('error', '保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加 AI 配置
  const addAiConfig = () => {
    const newConfig = new data.AIConfig({
      ID: 0,
      name: '',
      baseUrl: 'https://api.deepseek.com',
      apiKey: '',
      modelName: 'deepseek-reasoner',
      temperature: 0.1,
      maxTokens: 8192,
      timeOut: 6000,
      httpProxy: '',
      httpProxyEnabled: false,
    });
    setAiConfigs([...aiConfigs, newConfig]);
  };

  // 删除 AI 配置
  const removeAiConfig = (index: number) => {
    setAiConfigs(aiConfigs.filter((_, i) => i !== index));
  };

  // 更新单个 AI 配置字段
  const updateAiConfig = (index: number, field: keyof data.AIConfig, value: any) => {
    const newConfigs = [...aiConfigs];
    newConfigs[index] = new data.AIConfig({ ...newConfigs[index], [field]: value });
    setAiConfigs(newConfigs);
  };

  // 导出配置
  const handleExport = async () => {
    try {
      const result = await ExportConfig();
      showMessage('info', result);
    } catch (error) {
      console.error('导出配置失败:', error);
      showMessage('error', '导出配置失败');
    }
  };

  // 导入配置
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const config = JSON.parse(event.target?.result as string);
            
            // 映射到 state
            setConfigId(config.ID || 1);
            setTushareToken(config.tushareToken || '');
            setUpdateBasicInfoOnStart(config.updateBasicInfoOnStart || false);
            setRefreshInterval(config.refreshInterval || 1);
            setIsDark(config.darkTheme ?? true);
            setBrowserPath(config.browserPath || '');
            setEnableFund(config.enableFund || false);
            setEnableAgent(config.enableAgent || false);
            setQgqpBId(config.qgqpBId || '');
            setSponsorCode(config.sponsorCode || '');
            
            setDingPushEnable(config.dingPushEnable || false);
            setDingRobot(config.dingRobot || '');
            setLocalPushEnable(config.localPushEnable ?? true);
            setEnableDanmu(config.enableDanmu || false);
            setEnableNews(config.enableNews || false);
            setEnablePushNews(config.enablePushNews ?? true);
            setEnableOnlyPushRedNews(config.enableOnlyPushRedNews ?? true);
            
            setOpenAiEnable(config.openAiEnable || false);
            setCrawlTimeOut(config.crawlTimeOut || 30);
            setKDays(config.kDays || 30);
            setHttpProxyEnabled(config.httpProxyEnabled || false);
            setHttpProxy(config.httpProxy || '');
            setPrompt(config.prompt || '');
            setQuestionTemplate(config.questionTemplate || '{{stockName}}分析和总结');
            setAiConfigs(config.aiConfigs || []);
            
            showMessage('success', '配置导入成功，请点击保存按钮保存到后端');
          } catch (error) {
            console.error('配置文件解析失败:', error);
            showMessage('error', '配置文件解析失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 验证赞助码
  const handleVerifySponsorCode = async () => {
    if (!sponsorCode) {
      showMessage('info', '请输入赞助码');
      return;
    }
    
    try {
      const result = await CheckSponsorCode(sponsorCode);
      if (result.code) {
        showMessage('success', result.msg);
      } else {
        showMessage('error', result.msg);
      }
    } catch (error) {
      console.error('验证赞助码失败:', error);
      showMessage('error', '验证赞助码失败');
    }
  };

  // 发送测试通知
  const sendTestNotice = async () => {
    const markdown = "### 测试\n" + new Date();
    const msg = JSON.stringify({
      msgtype: "markdown",
      markdown: {
        title: new Date().toString(),
        text: markdown
      },
      at: {
        isAtAll: true
      }
    });

    try {
      const result = await SendDingDingMessageByType(msg, "test-" + new Date().getTime(), 1);
      showMessage('info', result);
    } catch (error) {
      console.error('发送测试通知失败:', error);
      showMessage('error', '发送测试通知失败');
    }
  };

  // Toggle Switch 组件
  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-cyan-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500/90 text-white' :
          message.type === 'error' ? 'bg-red-500/90 text-white' :
          'bg-blue-500/90 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-card border border-border px-6 py-4 rounded-lg text-foreground">加载中...</div>
        </div>
      )}

      {/* 头部 */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <SettingsIcon className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl text-foreground font-light">系统设置</h2>
            <p className="text-xs text-muted-foreground">System Settings · Configuration</p>
          </div>
        </div>
      </div>

      {/* 基础设置 */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl mt-2.5">
        <div className="mb-4">
          <h3 className="text-base text-green-400 font-medium mb-3 border-b border-green-500/30 pb-2">基础设置</h3>
        </div>

        <div className="space-y-4">
          {/* Tushare Token + 开关 */}
          <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Tushare Token:</label>
              <input
                type="text"
                value={tushareToken}
                onChange={(e) => setTushareToken(e.target.value)}
                placeholder="Tushare api token"
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex items-end gap-4">
              <ToggleSwitch checked={updateBasicInfoOnStart} onChange={setUpdateBasicInfoOnStart} label="启动时更新基础信息" />
              <ToggleSwitch checked={isDark} onChange={setIsDark} label="暗黑主题" />
            </div>
          </div>

          {/* 数据刷新间隔 */}
          <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">数据刷新间隔(秒):</label>
              <input
                type="number"
                min="1"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex items-end gap-4">
              <ToggleSwitch checked={enableFund} onChange={setEnableFund} label="指数基金" />
              <ToggleSwitch checked={enableAgent} onChange={setEnableAgent} label="AI智能体" />
            </div>
          </div>

          {/* 浏览器安装路径 */}
          <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">浏览器安装路径:</label>
              <input
                type="text"
                value={browserPath}
                onChange={(e) => setBrowserPath(e.target.value)}
                placeholder="浏览器安装路径"
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">东财唯一标识:</label>
              <input
                type="text"
                value={qgqpBId}
                onChange={(e) => setQgqpBId(e.target.value)}
                placeholder="东财唯一标识"
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* 赞助码 */}
          <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">赞助码:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sponsorCode}
                  onChange={(e) => setSponsorCode(e.target.value)}
                  placeholder="赞助码"
                  className="flex-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                />
                <button 
                  onClick={handleVerifySponsorCode}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-all whitespace-nowrap"
                >
                  验证
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-base text-green-400 font-medium mb-3 border-b border-green-500/30 pb-2">通知设置</h3>
        </div>

        <div className="space-y-4">
          <div
            className={cn(
              "grid gap-4",
              compactLayout ? "grid-cols-2 md:grid-cols-5" : "grid-cols-5",
            )}
          >
            <ToggleSwitch checked={dingPushEnable} onChange={setDingPushEnable} label="钉钉推送" />
            <ToggleSwitch checked={localPushEnable} onChange={setLocalPushEnable} label="本地推送" />
            <ToggleSwitch checked={enableDanmu} onChange={setEnableDanmu} label="弹幕功能" />
            <ToggleSwitch checked={enableNews} onChange={setEnableNews} label="显示滚动快讯" />
            <ToggleSwitch checked={enablePushNews} onChange={setEnablePushNews} label="市场资讯提醒" />
          </div>

          {/* 只提醒红字新闻 - 条件显示 */}
          {enablePushNews && (
            <div
              className={cn(
                "grid gap-4",
                compactLayout ? "grid-cols-2 md:grid-cols-5" : "grid-cols-5",
              )}
            >
              <ToggleSwitch checked={enableOnlyPushRedNews} onChange={setEnableOnlyPushRedNews} label="只提醒红字或关注个股的新闻" />
            </div>
          )}

          {/* 钉钉机器人地址 - 条件显示 */}
          {dingPushEnable && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">钉钉机器人接口地址:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dingRobot}
                    onChange={(e) => setDingRobot(e.target.value)}
                    placeholder="请输入钉钉机器人接口地址"
                    className="flex-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  />
                  <button 
                    onClick={sendTestNotice}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400 hover:bg-blue-500/30 transition-all whitespace-nowrap"
                  >
                    发送测试通知
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI设置 */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-base text-green-400 font-medium mb-3 border-b border-green-500/30 pb-2">AI设置</h3>
        </div>

        <div className="space-y-4">
          {/* AI 诊股总开关 */}
          <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
            <ToggleSwitch checked={openAiEnable} onChange={setOpenAiEnable} label="AI诊股" />
          </div>

          {/* AI 设置详情 - 条件显示 */}
          {openAiEnable && (
            <>
              {/* 超时和K线天数 */}
              <div
                className={cn(
                  "grid gap-4",
                  compactLayout ? "grid-cols-1 md:grid-cols-4" : "grid-cols-4",
                )}
              >
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Crawler Timeout(秒):</label>
                  <input
                    type="number"
                    min="30"
                    value={crawlTimeOut}
                    onChange={(e) => setCrawlTimeOut(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">日K线数据(天):</label>
                  <input
                    type="number"
                    min="30"
                    max="60"
                    value={kDays}
                    onChange={(e) => setKDays(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
                <div className="flex items-end">
                  <ToggleSwitch checked={httpProxyEnabled} onChange={setHttpProxyEnabled} label="爬虫http代理" />
                </div>
                {httpProxyEnabled && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">http代理地址:</label>
                    <input
                      type="text"
                      value={httpProxy}
                      onChange={(e) => setHttpProxy(e.target.value)}
                      placeholder="爬虫http代理地址"
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>
                )}
              </div>

              {/* 提示词设置分割线 */}
              <div className="border-t border-border pt-4 mt-4">
                <span className="text-sm text-muted-foreground">默认提示词设置</span>
              </div>

              {/* 提示词 */}
              <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">默认系统提示词:</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="请输入系统提示词"
                    rows={4}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">默认个股分析提示词:</label>
                  <textarea
                    value={questionTemplate}
                    onChange={(e) => setQuestionTemplate(e.target.value)}
                    placeholder="请输入个股分析提示词:例如{{stockName}}[{{stockCode}}]分析和总结"
                    rows={4}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
                  />
                </div>
              </div>

              {/* AI模型服务配置分割线 */}
              <div className="border-t border-border pt-4 mt-4">
                <span className="text-sm text-muted-foreground">AI模型服务配置</span>
              </div>

              {/* AI 配置卡片列表 */}
              <div className="space-y-4">
                {aiConfigs.map((aiConfig, index) => (
                  <div key={index} className="bg-muted/40 dark:bg-slate-800/40 rounded-lg border border-border p-4">
                    {/* 卡片头部 */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">AI 配置 #{index + 1}</span>
                      <button
                        onClick={() => removeAiConfig(index)}
                        className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/30"
                      >
                        删除
                      </button>
                    </div>
                    
                    {/* 配置字段 */}
                    <div className={cn("grid gap-4", compactLayout ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2")}>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">配置名称:</label>
                        <input
                          type="text"
                          value={aiConfig.name || ''}
                          onChange={(e) => updateAiConfig(index, 'name', e.target.value)}
                          placeholder="配置名称"
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">接口地址:</label>
                        <input
                          type="text"
                          value={aiConfig.baseUrl || ''}
                          onChange={(e) => updateAiConfig(index, 'baseUrl', e.target.value)}
                          placeholder="AI接口地址"
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">令牌(apiKey):</label>
                        <input
                          type="password"
                          value={aiConfig.apiKey || ''}
                          onChange={(e) => updateAiConfig(index, 'apiKey', e.target.value)}
                          placeholder="apiKey"
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">模型名称:</label>
                        <input
                          type="text"
                          value={aiConfig.modelName || ''}
                          onChange={(e) => updateAiConfig(index, 'modelName', e.target.value)}
                          placeholder="AI模型名称"
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Temperature:</label>
                        <input
                          type="number"
                          step="0.1"
                          value={aiConfig.temperature ?? 0.1}
                          onChange={(e) => updateAiConfig(index, 'temperature', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">MaxTokens:</label>
                        <input
                          type="number"
                          value={aiConfig.maxTokens ?? 8192}
                          onChange={(e) => updateAiConfig(index, 'maxTokens', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Timeout(秒):</label>
                        <input
                          type="number"
                          min="60"
                          value={aiConfig.timeOut ?? 6000}
                          onChange={(e) => updateAiConfig(index, 'timeOut', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <ToggleSwitch
                          checked={aiConfig.httpProxyEnabled || false}
                          onChange={(val) => updateAiConfig(index, 'httpProxyEnabled', val)}
                          label="http代理"
                        />
                      </div>
                      
                      {aiConfig.httpProxyEnabled && (
                        <div
                          className={cn(
                            compactLayout ? "md:col-span-2" : "col-span-2",
                          )}
                        >
                          <label className="block text-sm text-muted-foreground mb-2">http代理地址:</label>
                          <input
                            type="text"
                            value={aiConfig.httpProxy || ''}
                            onChange={(e) => updateAiConfig(index, 'httpProxy', e.target.value)}
                            placeholder="http代理地址"
                            className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* 添加按钮 */}
                <button
                  onClick={addAiConfig}
                  className="w-full py-3 border-2 border-dashed border-cyan-500/30 rounded-lg text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                >
                  + 添加AI配置
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-2xl">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            导出配置
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-6 py-2.5 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            导入配置
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-2xl">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 配置信息保存在后端数据库中</p>
          <p>• 导出配置可将当前设置保存为JSON文件</p>
          <p>• 导入配置可从JSON文件恢复之前的设置，导入后需点击保存</p>
          <p>• 修改配置后请点击"保存设置"按钮使配置生效</p>
        </div>
      </div>
    </div>
  );
}
