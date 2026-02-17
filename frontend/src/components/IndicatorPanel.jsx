const AVAILABLE_INDICATORS = [
  { id: "sma_20", label: "SMA 20" },
  { id: "ema_20", label: "EMA 20" },
  { id: "rsi_14", label: "RSI" },
  { id: "macd", label: "MACD" },
  { id: "bollinger", label: "Bollinger" },
];

export default function IndicatorPanel({ indicators, onChange }) {
  const toggle = (id) => {
    if (indicators.includes(id)) {
      onChange(indicators.filter((i) => i !== id));
    } else {
      onChange([...indicators, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {AVAILABLE_INDICATORS.map((ind) => (
        <button
          key={ind.id}
          onClick={() => toggle(ind.id)}
          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition ${
            indicators.includes(ind.id)
              ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
              : "bg-slate-800/50 text-slate-500 border border-transparent hover:text-slate-300"
          }`}
        >
          {ind.label}
        </button>
      ))}
    </div>
  );
}
