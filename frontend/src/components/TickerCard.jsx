export default function TickerCard({ stock, isSelected, onClick }) {
  const positive = stock.percent_change >= 0;

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer rounded-xl p-3 md:p-4 transition-all duration-200
        border backdrop-blur-sm
        hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]
        ${isSelected
          ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.08)] scale-[1.01]"
          : "bg-[#111827]/80 border-slate-800/60 hover:border-slate-700/80 hover:bg-[#111827] dark:bg-[#111827]/80 dark:border-slate-800/60"
        }
      `}
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className={`text-xs font-semibold ${isSelected ? "text-blue-400" : "text-slate-400"}`}>
          {stock.symbol.replace(/\.(NS|BO)$/, "")}
        </span>
        <span
          className={`
            text-[10px] font-semibold px-1.5 md:px-2 py-0.5 rounded-full transition-colors duration-150
            ${positive
              ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
              : "bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
            }
          `}
        >
          {positive ? "\u25B2" : "\u25BC"} {Math.abs(stock.percent_change).toFixed(2)}%
        </span>
      </div>

      <p className="text-lg md:text-xl font-bold text-white tracking-tight">
        <span className="text-xs md:text-sm font-normal text-slate-500 mr-0.5">&#8377;</span>
        {stock.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>

      <div className="flex items-center gap-2 mt-1.5 md:mt-2">
        <span className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? "+" : ""}{stock.change.toFixed(2)}
        </span>
        <span className="text-[10px] text-slate-600">from prev close</span>
      </div>
    </div>
  );
}
