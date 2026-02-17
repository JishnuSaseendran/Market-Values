import { useState } from "react";
import useUpstoxStore from "../stores/upstoxStore";
import toast from "react-hot-toast";

export default function OrderBook({ orders, trades, onRefresh }) {
  const [tab, setTab] = useState("open");
  const { cancelOrder, modifyOrder } = useUpstoxStore();

  const openOrders = (orders || []).filter(
    (o) => o.status === "open" || o.status === "trigger pending" || o.status === "not modified"
  );
  const completedOrders = (orders || []).filter(
    (o) => o.status === "complete" || o.status === "traded" || o.status === "filled"
  );

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled");
      onRefresh?.();
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const tabs = [
    { key: "open", label: `Open Orders (${openOrders.length})` },
    { key: "completed", label: `Completed (${completedOrders.length})` },
    { key: "trades", label: `Trades (${(trades || []).length})` },
  ];

  const renderTable = (items, showActions = false) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800/60">
            {["Symbol", "Type", "Qty", "Price", "Status", "Time", ...(showActions ? [""] : [])].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                No orders
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                <td className="px-4 py-3 font-medium text-white">
                  {item.trading_symbol || item.instrument_token || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    item.transaction_type === "BUY" ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {item.transaction_type} {item.order_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{item.quantity || item.filled_quantity || 0}</td>
                <td className="px-4 py-3 text-slate-300">{item.price || item.average_price || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.status === "complete" || item.status === "traded" || item.status === "filled"
                      ? "bg-emerald-600/20 text-emerald-400"
                      : item.status === "cancelled" || item.status === "rejected"
                      ? "bg-red-600/20 text-red-400"
                      : "bg-blue-600/20 text-blue-400"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {item.order_timestamp || item.exchange_timestamp || "—"}
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCancel(item.order_id)}
                      className="px-2 py-1 rounded bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition"
                    >
                      Cancel
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 overflow-hidden">
      <div className="flex border-b border-slate-800/60">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium transition ${
              tab === t.key
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "open" && renderTable(openOrders, true)}
      {tab === "completed" && renderTable(completedOrders)}
      {tab === "trades" && renderTable(trades || [])}
    </div>
  );
}
