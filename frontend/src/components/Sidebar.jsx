export default function Sidebar({ stocks, selected, setSelected }) {
  return (
    <div className="w-72 bg-[#0b1022] border-r border-slate-800/60 flex flex-col">
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

      {/* Watchlist */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2">Watchlist</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {stocks.map((stock) => {
          const positive = stock.percent_change >= 0;
          const isActive = stock.symbol === selected;

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelected(stock.symbol)}
              className={`
                cursor-pointer rounded-lg px-3 py-3 mb-1 transition-all duration-150
                ${isActive
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "border border-transparent hover:bg-slate-800/50"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${isActive ? "text-blue-400" : "text-slate-200"}`}>
                    {stock.symbol.replace(".NS", "")}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">NSE</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">
                    {stock.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[11px] font-medium mt-0.5 ${positive ? "text-emerald-400" : "text-red-400"}`}>
                    {positive ? "+" : ""}{stock.percent_change.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
