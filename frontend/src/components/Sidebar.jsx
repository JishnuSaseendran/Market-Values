import { NavLink } from "react-router-dom";
import { HiHome, HiChartBar, HiViewGrid, HiScale, HiCollection, HiLightningBolt, HiSparkles } from "react-icons/hi";
import SearchBar from "./SearchBar";
import WatchlistManager from "./WatchlistManager";
import AlertManager from "./AlertManager";

const navLinks = [
  { to: "/", icon: HiHome, label: "Dashboard" },
  { to: "/market", icon: HiChartBar, label: "Market" },
  { to: "/heatmap", icon: HiViewGrid, label: "Heatmap" },
  { to: "/compare", icon: HiScale, label: "Compare" },
  { to: "/portfolio", icon: HiCollection, label: "Portfolio" },
];

export default function Sidebar({ stocks, selected, setSelected }) {
  return (
    <div className="w-72 bg-[#0b1022] border-r border-slate-800/60 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Market Values</h1>
            <p className="text-[10px] text-slate-500 font-medium">REAL-TIME TRACKER</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <SearchBar />
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-3 pb-2">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150 ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 font-medium border-l-2 border-blue-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-2 border-transparent"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Trading + AI Predict — separated with distinct styling */}
      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-1.5">Live Trading</p>
        <NavLink
          to="/trading"
          className={({ isActive }) =>
            `trading-shimmer flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive
                ? "bg-violet-500/15 text-violet-300 font-semibold border border-violet-500/30 shadow-[0_0_16px_rgba(139,92,246,0.15)]"
                : "text-violet-400/80 hover:bg-violet-500/10 hover:text-violet-300 border border-transparent"
            }`
          }
        >
          <HiLightningBolt className="w-4 h-4" />
          <span className="flex-1">Trading</span>
          <span className="text-[9px] font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full tracking-wider">
            LIVE
          </span>
        </NavLink>
        <NavLink
          to="/predict"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mt-0.5 ${
              isActive
                ? "bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-[0_0_16px_rgba(99,102,241,0.15)]"
                : "text-indigo-400/80 hover:bg-indigo-500/10 hover:text-indigo-300 border border-transparent"
            }`
          }
        >
          <HiSparkles className="w-4 h-4" />
          <span className="flex-1">AI Predict</span>
          <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full tracking-wider">
            LSTM
          </span>
        </NavLink>
      </div>

      <div className="border-t border-slate-800/60 mt-1" />

      {/* Stock Watchlist */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2">Live Prices</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {stocks.map((stock) => {
          const positive = stock.percent_change >= 0;
          const isActive = stock.symbol === selected;

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelected(stock.symbol)}
              className={`cursor-pointer rounded-lg px-3 py-2.5 mb-0.5 transition-all duration-150
                ${isActive
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "border border-transparent hover:bg-slate-800/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold ${isActive ? "text-blue-400" : "text-slate-200"}`}>
                    {stock.symbol.replace(".NS", "")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-200">
                    {stock.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[10px] font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                    {positive ? "+" : ""}{stock.percent_change.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-800/60" />

      {/* Watchlist Manager */}
      <div className="pt-2">
        <WatchlistManager onSelectSymbol={setSelected} />
      </div>
    </div>
  );
}
