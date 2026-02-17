import { useEffect } from "react";
import useUpstoxStore from "../stores/upstoxStore";
import UpstoxConnect from "../components/UpstoxConnect";
import OrderForm from "../components/OrderForm";
import PositionsTable from "../components/PositionsTable";
import OrderBook from "../components/OrderBook";

export default function TradingPage() {
  const { linked, checkStatus, funds, fetchFunds, positions, fetchPositions, orders, fetchOrders, trades, fetchTrades } = useUpstoxStore();

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (linked) {
      fetchFunds();
      fetchPositions();
      fetchOrders();
      fetchTrades();
    }
  }, [linked]);

  const refreshAll = () => {
    fetchPositions();
    fetchOrders();
    fetchTrades();
    fetchFunds();
  };

  if (!linked) {
    return (
      <div className="p-4 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Trading</h2>
        <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-8 text-center">
          <p className="text-slate-400 mb-4">Connect your Upstox account to start trading</p>
          <UpstoxConnect />
        </div>
      </div>
    );
  }

  const equity = funds?.equity || funds;
  const availableMargin = equity?.available_margin || equity?.available?.cash || 0;
  const usedMargin = equity?.used_margin || 0;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Trading</h2>
        <button
          onClick={refreshAll}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Funds Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4">
          <p className="text-xs text-slate-500 mb-1">Available Margin</p>
          <p className="text-lg font-bold text-emerald-400">
            {Number(availableMargin).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4">
          <p className="text-xs text-slate-500 mb-1">Used Margin</p>
          <p className="text-lg font-bold text-white">
            {Number(usedMargin).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4">
          <p className="text-xs text-slate-500 mb-1">Open Positions</p>
          <p className="text-lg font-bold text-white">{positions?.length || 0}</p>
        </div>
        <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4">
          <p className="text-xs text-slate-500 mb-1">Open Orders</p>
          <p className="text-lg font-bold text-white">
            {(orders || []).filter((o) => o.status === "open" || o.status === "trigger pending").length}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <OrderForm onOrderPlaced={refreshAll} />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Positions</h3>
          <PositionsTable positions={positions} />
        </div>
      </div>

      {/* Order Book */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Order Book</h3>
        <OrderBook orders={orders} trades={trades} onRefresh={refreshAll} />
      </div>
    </div>
  );
}
