import IndicatorPanel from "./IndicatorPanel";

const TIMEFRAMES = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1wk" },
  { label: "1M", value: "1mo" },
];

export default function TimeframeSelector({ value, onChange, indicators, onIndicatorsChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg bg-[#0a0e1a] border border-slate-700/50 p-0.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onChange(tf.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              value === tf.value
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <IndicatorPanel indicators={indicators} onChange={onIndicatorsChange} />
    </div>
  );
}
