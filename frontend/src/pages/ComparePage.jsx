import { useState } from "react";
import api from "../lib/api";
import ComparisonChart from "../components/ComparisonChart";

export default function ComparePage() {
  const [input, setInput] = useState("RELIANCE.NS,TCS.NS,INFY.NS");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/market/compare?symbols=${encodeURIComponent(input)}`);
      setData(res.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Compare Stocks</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="RELIANCE.NS,TCS.NS,INFY.NS"
          className="flex-1 px-3 py-2 rounded-lg bg-[#0f1629] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Compare"}
        </button>
      </div>

      {data && (
        <>
          <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4 md:p-6 mb-6">
            <ComparisonChart data={data} />
          </div>

          <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {["Symbol", "Price", "Change", "% Change"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.stock.symbol} className="border-b border-slate-800/30">
                    <td className="px-4 py-3 font-medium text-white">{item.stock.symbol.replace(".NS", "")}</td>
                    <td className="px-4 py-3 text-slate-300">{item.stock.current_price?.toFixed(2)}</td>
                    <td className={`px-4 py-3 ${item.stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {item.stock.change >= 0 ? "+" : ""}{item.stock.change?.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 ${item.stock.percent_change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {item.stock.percent_change >= 0 ? "+" : ""}{item.stock.percent_change?.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
