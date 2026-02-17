export default function GainersLosersTable({ title, stocks, isLoser }) {
  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-2">
        {stocks?.map((stock, i) => {
          const positive = stock.percent_change >= 0;
          return (
            <div key={stock.symbol} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                <span className="text-sm font-medium text-white">{stock.symbol.replace(".NS", "")}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-300 mr-3">{stock.current_price?.toFixed(2)}</span>
                <span className={`text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
                  {positive ? "+" : ""}{stock.percent_change?.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
