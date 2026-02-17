import { useEffect, useState } from "react";
import { HiPlus, HiTrash, HiPencil } from "react-icons/hi";
import api from "../lib/api";
import toast from "react-hot-toast";
import PortfolioForm from "../components/PortfolioForm";
import HoldingsTable from "../components/HoldingsTable";
import useUpstoxStore from "../stores/upstoxStore";

export default function PortfolioPage() {
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("manual");
  const { linked, checkStatus, holdings, fetchHoldings } = useUpstoxStore();

  const fetchPortfolio = async () => {
    try {
      const res = await api.get("/portfolio");
      setData(res.data);
    } catch {
      toast.error("Failed to load portfolio");
    }
  };

  useEffect(() => {
    fetchPortfolio();
    checkStatus();
  }, []);

  useEffect(() => {
    if (linked) fetchHoldings();
  }, [linked]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success("Entry deleted");
      fetchPortfolio();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Portfolio</h2>
        <button
          onClick={() => { setEditEntry(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
        >
          <HiPlus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Tabs if Upstox linked */}
      {linked && (
        <div className="flex gap-1 mb-6 bg-[#0f1629] rounded-lg p-1 w-fit border border-slate-800/60">
          {[
            { key: "manual", label: "Manual Portfolio" },
            { key: "upstox", label: "Upstox Holdings" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "upstox" && linked ? (
        <HoldingsTable holdings={holdings} />
      ) : (
        <>
      {/* Summary */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Invested", value: `\u20B9${data.total_invested.toLocaleString("en-IN")}` },
            { label: "Current Value", value: `\u20B9${data.total_current.toLocaleString("en-IN")}` },
            { label: "Total P&L", value: `\u20B9${data.total_pnl.toLocaleString("en-IN")}`, color: data.total_pnl >= 0 },
            { label: "P&L %", value: `${data.total_pnl_percent >= 0 ? "+" : ""}${data.total_pnl_percent.toFixed(2)}%`, color: data.total_pnl_percent >= 0 },
          ].map((item) => (
            <div key={item.label} className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.color !== undefined ? (item.color ? "text-emerald-400" : "text-red-400") : "text-white"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {["Symbol", "Qty", "Buy Price", "Current", "Invested", "Current Val", "P&L", "P&L %", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.entries?.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-white">{entry.symbol.replace(".NS", "")}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.quantity}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.buy_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.current_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.invested.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.current_value.toLocaleString("en-IN")}</td>
                  <td className={`px-4 py-3 font-medium ${entry.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {entry.pnl >= 0 ? "+" : ""}{entry.pnl.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 font-medium ${entry.pnl_percent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {entry.pnl_percent >= 0 ? "+" : ""}{entry.pnl_percent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditEntry(entry); setShowForm(true); }} className="p-1 text-slate-500 hover:text-blue-400"><HiPencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1 text-slate-500 hover:text-red-400"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.entries || data.entries.length === 0) && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">No portfolio entries yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <PortfolioForm
          entry={editEntry}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchPortfolio(); }}
        />
      )}
        </>
      )}
    </div>
  );
}
