const INDEX_NAMES = {
  "^NSEI": "NIFTY 50",
  "^BSESN": "SENSEX",
};

export default function IndexCard({ data }) {
  const positive = data.percent_change >= 0;
  const name = INDEX_NAMES[data.symbol] || data.symbol;

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-400">{name}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        }`}>
          {positive ? "\u25B2" : "\u25BC"} {Math.abs(data.percent_change).toFixed(2)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-white">
        {data.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>
      <p className={`text-sm mt-1 ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {positive ? "+" : ""}{data.change?.toFixed(2)}
      </p>
    </div>
  );
}
