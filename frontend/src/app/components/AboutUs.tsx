import { Info, Users, Target, Zap, Shield, TrendingUp, Mail, Github, Twitter } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="space-y-3">
      {/* 头部 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-white font-light">关于我们</h2>
            <p className="text-xs text-gray-400">About Us · Financial Dashboard</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-300 leading-relaxed">
          金融看板是一个现代化的金融数据可视化平台，致力于为投资者提供实时、准确、全面的市场数据和资讯服务。
          我们采用前沿的科技设计理念，打造沉浸式的数据体验，让复杂的金融信息一目了然。
        </p>
      </div>

      {/* 核心特性 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-base text-white font-medium mb-2">实时数据</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            毫秒级数据更新，确保您获得最新的市场行情和资讯动态，不错过任何交易机会。
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-base text-white font-medium mb-2">智能分析</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            运用AI算法对市场数据进行深度分析，提供专业的市场情绪判断和行业热度追踪。
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-base text-white font-medium mb-2">数据安全</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            采用银行级数据加密技术，保障您的个人信息和交易数据安全，值得信赖。
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-base text-white font-medium mb-2">多维度分析</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            提供市场情绪、行业热力、资金流向等多维度数据分析，助您全方位把握市场脉搏。
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-base text-white font-medium mb-2">用户至上</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            简洁直观的界面设计，流畅的操作体验，让每一位用户都能轻松上手使用。
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-2xl hover:border-cyan-500/30 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Info className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-base text-white font-medium mb-2">专业资讯</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            汇聚全网金融资讯，提供深度研报和行业分析，让您掌握第一手市场信息。
          </p>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6 shadow-2xl">
        <h3 className="text-lg text-white font-light mb-4">平台数据</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-light text-cyan-400 mb-1">100K+</div>
            <div className="text-xs text-gray-400">活跃用户</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-light text-purple-400 mb-1">5000+</div>
            <div className="text-xs text-gray-400">覆盖股票</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-light text-green-400 mb-1">10M+</div>
            <div className="text-xs text-gray-400">日均数据量</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-light text-orange-400 mb-1">99.9%</div>
            <div className="text-xs text-gray-400">系统可用性</div>
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6 shadow-2xl">
        <h3 className="text-lg text-white font-light mb-4">技术架构</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'React', color: 'cyan' },
            { name: 'TypeScript', color: 'blue' },
            { name: 'Tailwind CSS', color: 'purple' },
            { name: 'Recharts', color: 'green' },
            { name: 'Lucide Icons', color: 'orange' },
            { name: 'Motion', color: 'pink' },
            { name: 'WebSocket', color: 'yellow' },
            { name: 'REST API', color: 'indigo' }
          ].map((tech) => (
            <div
              key={tech.name}
              className={`px-3 py-2 bg-${tech.color}-500/10 border border-${tech.color}-500/30 rounded-lg text-center hover:bg-${tech.color}-500/20 transition-all`}
            >
              <span className={`text-xs text-${tech.color}-400`}>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 联系方式 */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-6 shadow-2xl">
        <h3 className="text-lg text-white font-light mb-4">联系我们</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="text-xs text-gray-400">邮箱</div>
              <div className="text-sm text-white">contact@finboard.com</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Github className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-xs text-gray-400">GitHub</div>
              <div className="text-sm text-white">github.com/finboard</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Twitter className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-xs text-gray-400">Twitter</div>
              <div className="text-sm text-white">@FinBoard</div>
            </div>
          </button>
        </div>
      </div>

      {/* 版权信息 */}
      <div className="text-center py-6 border-t border-white/10">
        <p className="text-xs text-gray-500">
          © 2026 金融看板 Financial Dashboard. All rights reserved.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          本平台数据仅供参考，投资有风险，入市需谨慎。
        </p>
      </div>
    </div>
  );
}
