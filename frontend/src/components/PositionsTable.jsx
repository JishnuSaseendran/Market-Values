import useUpstoxStore from "../stores/upstoxStore";
import toast from "react-hot-toast";

export default function PositionsTable({ positions }) {
  const { placeOrder, fetchPositions } = useUpstoxStore();

  const handleClose = async (position) => {
    try {
      const txnType = position.quantity > 0 ? "SELL" : "BUY";
      const qty = Math.abs(position.quantity);
      await placeOrder({
        symbol: position.instrument_token,
        qty,
        order_type: "MARKET",
        transaction_type: txnType,
        product: position.product || "MIS",
        validity: "DAY",
      });
      toast.success(`Close order placed for ${position.trading_symbol || position.instrument_token}`);
      fetchPositions();
    } catch {
      toast.error("Failed to close position");
    }
  };

  if (!positions || positions.length === 0) {
    return (
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-8 text-center text-slate-500 text-sm">
        No open positions
      </div>
    );
  }

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              {["Symbol", "Qty", "Avg Price", "LTP", "P&L", "P&L %", "Product", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => {
              const pnl = pos.pnl || pos.unrealised || 0;
              const avgPrice = pos.average_price || 0;
              const ltp = pos.last_price || 0;
              const qty = pos.quantity || 0;
              const invested = avgPrice * Math.abs(qty);
              const pnlPct = invested ? (pnl / invested) * 100 : 0;

              return (
                <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-white">
                    {pos.trading_symbol || pos.instrument_token || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{qty}</td>
                  <td className="px-4 py-3 text-slate-300">{avgPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{ltp.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-medium ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 font-medium ${pnlPct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{pos.product || "—"}</td>
                  <td className="px-4 py-3">
                    {qty !== 0 && (
                      <button
                        onClick={() => handleClose(pos)}
                        className="px-2 py-1 rounded bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition"
                      >
                        Close
                      </button>
                    )}
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
