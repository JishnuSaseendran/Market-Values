export default function HoldingsTable({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-8 text-center text-slate-500 text-sm">
        No holdings found
      </div>
    );
  }

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              {["Symbol", "Qty", "Avg Price", "LTP", "Current Value", "P&L", "P&L %"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => {
              const qty = h.quantity || 0;
              const avgPrice = h.average_price || 0;
              const ltp = h.last_price || 0;
              const currentValue = qty * ltp;
              const invested = qty * avgPrice;
              const pnl = h.pnl || (currentValue - invested);
              const pnlPct = invested ? (pnl / invested) * 100 : 0;

              return (
                <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-white">
                    {h.trading_symbol || h.instrument_token || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{qty}</td>
                  <td className="px-4 py-3 text-slate-300">{avgPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{ltp.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-4 py-3 font-medium ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 font-medium ${pnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
