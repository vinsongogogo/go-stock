import { useState } from 'react';
import { Settings as SettingsIcon, Save, Upload, Download } from 'lucide-react';

export function Settings() {
  // 基础设置
  const [tushareToken, setTushareToken] = useState('');
  const [browserPath, setBrowserPath] = useState('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  const [eastMoneyId, setEastMoneyId] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');

  // 基础设置开关
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [validateClipboard, setValidateClipboard] = useState(false);
  const [fillTheme, setFillTheme] = useState(false);
  const [indexFund, setIndexFund] = useState(false);
  const [aiLibrary, setAiLibrary] = useState(false);

  // 通知设置开关
  const [subscribeNotify, setSubscribeNotify] = useState(false);
  const [localNotify, setLocalNotify] = useState(false);
  const [alertFunction, setAlertFunction] = useState(false);
  const [showFlashNews, setShowFlashNews] = useState(false);
  const [marketNewsAlert, setMarketNewsAlert] = useState(false);

  // AI设置开关
  const [aiDetection, setAiDetection] = useState(false);
  const [crawlerNotify, setCrawlerNotify] = useState(false);

  const handleSave = () => {
    const config = {
      tushareToken,
      browserPath,
      eastMoneyId,
      purchaseCode,
      autoUpdate,
      validateClipboard,
      fillTheme,
      indexFund,
      aiLibrary,
      subscribeNotify,
      localNotify,
      alertFunction,
      showFlashNews,
      marketNewsAlert,
      aiDetection,
      crawlerNotify,
    };
    console.log('保存配置:', config);
    // 这里可以添加实际的保存逻辑
  };

  const handleExport = () => {
    const config = {
      tushareToken,
      browserPath,
      eastMoneyId,
      purchaseCode,
      autoUpdate,
      validateClipboard,
      fillTheme,
      indexFund,
      aiLibrary,
      subscribeNotify,
      localNotify,
      alertFunction,
      showFlashNews,
      marketNewsAlert,
      aiDetection,
      crawlerNotify,
    };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'config.json';
    link.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string);
            setTushareToken(config.tushareToken || '');
            setBrowserPath(config.browserPath || '');
            setEastMoneyId(config.eastMoneyId || '');
            setPurchaseCode(config.purchaseCode || '');
            setAutoUpdate(config.autoUpdate || false);
            setValidateClipboard(config.validateClipboard || false);
            setFillTheme(config.fillTheme || false);
            setIndexFund(config.indexFund || false);
            setAiLibrary(config.aiLibrary || false);
            setSubscribeNotify(config.subscribeNotify || false);
            setLocalNotify(config.localNotify || false);
            setAlertFunction(config.alertFunction || false);
            setShowFlashNews(config.showFlashNews || false);
            setMarketNewsAlert(config.marketNewsAlert || false);
            setAiDetection(config.aiDetection || false);
            setCrawlerNotify(config.crawlerNotify || false);
          } catch (error) {
            console.error('配置文件解析失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Toggle Switch 组件
  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-300">{label}:</span>
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
    <div className="space-y-3">
      {/* 头部 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white font-light">系统设置</h2>
            <p className="text-xs text-gray-400">System Settings · Configuration</p>
          </div>
        </div>
      </div>

      {/* 基础设置 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-base text-green-400 font-medium mb-3 border-b border-green-500/30 pb-2">基础设置</h3>
        </div>

        <div className="space-y-4">
          {/* Tushare Token */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Tushare Token:</label>
              <input
                type="text"
                value={tushareToken}
                onChange={(e) => setTushareToken(e.target.value)}
                placeholder="Tushare api token"
                className="w-full px-3 py-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex items-end gap-4">
              <ToggleSwitch checked={autoUpdate} onChange={setAutoUpdate} label="启动时更新新碳盘" />
              <ToggleSwitch checked={validateClipboard} onChange={setValidateClipboard} label="校验剪贴板时间" />
              <ToggleSwitch checked={fillTheme} onChange={setFillTheme} label="填充主题" />
            </div>
          </div>

          {/* 浏览器安装路径 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">浏览器安装路径:</label>
              <input
                type="text"
                value={browserPath}
                onChange={(e) => setBrowserPath(e.target.value)}
                placeholder="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
                className="w-full px-3 py-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex items-end gap-4">
              <ToggleSwitch checked={indexFund} onChange={setIndexFund} label="指数基金" />
              <ToggleSwitch checked={aiLibrary} onChange={setAiLibrary} label="AI智能库" />
            </div>
          </div>

          {/* 东财端一标识 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">东财端一标识:</label>
              <input
                type="text"
                value={eastMoneyId}
                onChange={(e) => setEastMoneyId(e.target.value)}
                placeholder="东财端一标识"
                className="w-full px-3 py-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">购物栏:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={purchaseCode}
                  onChange={(e) => setPurchaseCode(e.target.value)}
                  placeholder="单期码"
                  className="flex-1 px-3 py-2 bg-slate-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                />
                <button className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-all whitespace-nowrap">
                  验证
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-base text-green-400 font-medium mb-3 border-b border-green-500/30 pb-2">通知设置</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ToggleSwitch checked={subscribeNotify} onChange={setSubscribeNotify} label="订阅通送" />
          <ToggleSwitch checked={localNotify} onChange={setLocalNotify} label="本地通送" />
          <ToggleSwitch checked={alertFunction} onChange={setAlertFunction} label="强黑功能" />
          <ToggleSwitch checked={showFlashNews} onChange={setShowFlashNews} label="显示液级快讯" />
          <ToggleSwitch checked={marketNewsAlert} onChange={setMarketNewsAlert} label="市场资讯提醒" />
        </div>
      </div>

      {/* AI设置 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-base text-green-400 font-medium mb-3 border-b border-green-500/30 pb-2">AI设置</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleSwitch checked={aiDetection} onChange={setAiDetection} label="AI检波" />
          <ToggleSwitch checked={crawlerNotify} onChange={setCrawlerNotify} label="爬虫Rhttpfy配置" />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
          >
            <Save className="w-4 h-4" />
            保存设置
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            导出配置
          </button>
          <button
            onClick={handleImport}
            className="px-6 py-2.5 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            <Upload className="w-4 h-4" />
            导入配置
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl">
        <div className="text-xs text-gray-400 space-y-1">
          <p>• 配置信息保存在本地浏览器存储中</p>
          <p>• 导出配置可将当前设置保存为JSON文件</p>
          <p>• 导入配置可从JSON文件恢复之前的设置</p>
          <p>• 修改配置后请点击"保存设置"按钮使配置生效</p>
        </div>
      </div>
    </div>
  );
}
