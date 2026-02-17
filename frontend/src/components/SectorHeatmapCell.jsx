export default function SectorHeatmapCell({ stock }) {
  const change = stock.percent_change;
  const positive = change >= 0;

  // Color intensity based on magnitude
  const intensity = Math.min(Math.abs(change) / 3, 1);
  const bgColor = positive
    ? `rgba(16, 185, 129, ${0.1 + intensity * 0.3})`
    : `rgba(239, 68, 68, ${0.1 + intensity * 0.3})`;

  return (
    <div
      className="rounded-lg px-3 py-2 border border-slate-800/30"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white">{stock.symbol.replace(".NS", "")}</span>
        <span className={`text-[10px] font-bold ${positive ? "text-emerald-300" : "text-red-300"}`}>
          {positive ? "+" : ""}{change.toFixed(2)}%
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mt-0.5">
        {stock.current_price?.toFixed(2)}
      </p>
    </div>
  );
}
