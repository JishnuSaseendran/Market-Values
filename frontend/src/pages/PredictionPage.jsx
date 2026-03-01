import { useState } from "react";
import { HiSparkles, HiSearch, HiInformationCircle, HiExclamationCircle } from "react-icons/hi";
import api from "../lib/api";
import PredictionChart from "../components/PredictionChart";

const FORECAST_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

const SUGGESTIONS = [
  "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
  "SBIN.NS", "WIPRO.NS", "HCLTECH.NS", "BAJFINANCE.NS", "ASIANPAINT.NS",
  "TMCV.BO",
];

export default function PredictionPage() {
  const [symbol, setSymbol] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [forecastDays, setForecastDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = inputValue.length > 0
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(inputValue.toLowerCase()))
    : SUGGESTIONS;

  const runPrediction = async (sym, days) => {
    if (!sym) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await api.get(`/predictions/${sym}?days=${days}`);
      setData(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Prediction failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sym = inputValue.trim().toUpperCase();
    if (!sym) return;
    if (!sym.includes(".")) {
      setInputValue(sym + ".NS");
      setSymbol(sym + ".NS");
      runPrediction(sym + ".NS", forecastDays);
    } else {
      setSymbol(sym);
      runPrediction(sym, forecastDays);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (s) => {
    setInputValue(s);
    setSymbol(s);
    setShowSuggestions(false);
    runPrediction(s, forecastDays);
  };

  const handleDaysChange = (days) => {
    setForecastDays(days);
    if (symbol) runPrediction(symbol, days);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <HiSparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Price Prediction</h1>
          <p className="text-xs text-slate-500">LSTM neural network forecast</p>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. RELIANCE.NS or TMCV.BO"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Forecast toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {FORECAST_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDaysChange(value)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                  forecastDays === value
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <HiSearch className="w-4 h-4" />
            {loading ? "Training…" : "Predict"}
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-violet-500/40 animate-ping" style={{ animationDelay: "0.15s" }} />
              <div className="absolute inset-4 rounded-full bg-violet-500/20 animate-pulse" />
              <HiSparkles className="absolute inset-0 m-auto w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="text-white font-medium">Training LSTM model…</p>
              <p className="text-slate-500 text-sm mt-1">Fetching 2 years of data and fitting neural network</p>
            </div>
            {/* Skeleton bars */}
            <div className="w-full mt-2 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 bg-slate-800 rounded animate-pulse" style={{ width: `${85 - i * 10}%`, marginLeft: "auto", marginRight: "auto" }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <HiExclamationCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-400 font-medium text-sm">Prediction Failed</p>
            <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-4">
          {/* Chart */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {data.symbol.replace(/\.(NS|BO)$/, "")}
                  <span className="text-slate-500 font-normal text-sm ml-1">
                    {data.symbol.match(/\.(NS|BO)$/)?.[0] ?? ""}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {data.model_info.forecast_days}-day forecast · {data.historical.length} historical data points
                </p>
              </div>
              <div className="text-right">
                {data.predicted?.length > 0 && (
                  <>
                    <p className="text-xs text-slate-500 mb-0.5">Predicted end price</p>
                    <p className="text-lg font-bold text-violet-400">
                      ₹{data.predicted[data.predicted.length - 1].value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    {data.historical?.length > 0 && (() => {
                      const lastActual = data.historical[data.historical.length - 1].value;
                      const lastPred = data.predicted[data.predicted.length - 1].value;
                      const pct = ((lastPred - lastActual) / lastActual * 100).toFixed(2);
                      const positive = lastPred >= lastActual;
                      return (
                        <p className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                          {positive ? "+" : ""}{pct}% from current
                        </p>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
            <PredictionChart
              historical={data.historical}
              predicted={data.predicted}
              confidenceBand={data.confidence_band}
            />
          </div>

          {/* Model info */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <HiInformationCircle className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-400">Model Information</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Architecture", value: "LSTM × 2" },
                { label: "Look-back window", value: `${data.model_info.look_back} days` },
                { label: "Training samples", value: data.model_info.training_samples.toLocaleString() },
                { label: "Model cached", value: data.model_info.model_cached ? "Yes" : "No (fresh)" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-800/50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 mt-3">
              Disclaimer: AI predictions are for informational purposes only and do not constitute financial advice.
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !data && (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-10 text-center">
          <HiSparkles className="w-10 h-10 text-violet-400/40 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Enter a stock symbol to run AI prediction</p>
          <p className="text-slate-600 text-sm mt-1">
            Uses LSTM neural networks trained on 2 years of daily price data
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {SUGGESTIONS.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-lg transition-colors border border-slate-700/50"
              >
                {s.replace(/\.(NS|BO)$/, "")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
