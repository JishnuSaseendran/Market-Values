import { useEffect } from "react";
import useUpstoxStore from "../stores/upstoxStore";
import UpstoxConnect from "../components/UpstoxConnect";
import OrderForm from "../components/OrderForm";
import PositionsTable from "../components/PositionsTable";
import OrderBook from "../components/OrderBook";
import { HiLightningBolt, HiRefresh, HiCurrencyRupee, HiTrendingUp, HiClipboardList, HiShieldCheck } from "react-icons/hi";

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
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="text-center pt-8 md:pt-16">
          {/* Hero icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-500/10 mb-6 animate-pulse-glow">
            <HiLightningBolt className="w-10 h-10 text-violet-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Start Trading Live</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Connect your Upstox account to place orders, track positions, and manage your portfolio in real time.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["Live Orders", "Position Tracking", "Real-time Funds", "Order History"].map((feature) => (
              <span
                key={feature}
                className="text-xs font-medium text-violet-300/80 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Connect card */}
          <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-6">
            <UpstoxConnect />
          </div>

          <p className="text-[11px] text-slate-600 mt-4 flex items-center justify-center gap-1">
            <HiShieldCheck className="w-3.5 h-3.5" />
            Secure OAuth2 authentication via Upstox
          </p>
        </div>
      </div>
    );
  }

  const equity = funds?.equity || funds;
  const availableMargin = equity?.available_margin || equity?.available?.cash || 0;
  const usedMargin = equity?.used_margin || 0;
  const openPositions = positions?.length || 0;
  const openOrders = (orders || []).filter((o) => o.status === "open" || o.status === "trigger pending").length;

  const statCards = [
    { label: "Available Margin", value: `₹${Number(availableMargin).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "emerald", icon: HiCurrencyRupee },
    { label: "Used Margin", value: `₹${Number(usedMargin).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "amber", icon: HiTrendingUp },
    { label: "Open Positions", value: openPositions, color: "blue", icon: HiClipboardList },
    { label: "Open Orders", value: openOrders, color: "violet", icon: HiClipboardList },
  ];

  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-500/40" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: "text-amber-500/40" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: "text-blue-500/40" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", icon: "text-violet-500/40" },
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Trading</h2>
        <button
          onClick={refreshAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 hover:text-white transition-all duration-150 active:scale-95"
        >
          <HiRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Funds Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, color, icon: Icon }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className={`${c.bg} rounded-xl border ${c.border} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{label}</p>
                <Icon className={`w-4 h-4 ${c.icon}`} />
              </div>
              <p className={`text-lg font-bold ${c.text}`}>{value}</p>
            </div>
          );
        })}
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
