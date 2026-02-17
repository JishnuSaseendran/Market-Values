import { useEffect, useState } from "react";
import { HiPlus, HiTrash, HiBell } from "react-icons/hi";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function AlertManager() {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState("above");
  const [targetPrice, setTargetPrice] = useState("");

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts");
      setAlerts(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const sym = symbol.toUpperCase().endsWith(".NS") ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;
      await api.post("/alerts", { symbol: sym, condition, target_price: parseFloat(targetPrice) });
      toast.success("Alert created");
      setShowForm(false);
      setSymbol(""); setTargetPrice("");
      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create alert");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      fetchAlerts();
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
          <HiBell className="w-4 h-4" /> Price Alerts
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="text-slate-400 hover:text-white transition">
          <HiPlus className="w-4 h-4" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-3 rounded-lg bg-slate-800/30 space-y-2">
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol"
            className="w-full px-2 py-1.5 rounded bg-[#0a0e1a] border border-slate-700 text-white text-xs outline-none" required
          />
          <div className="flex gap-2">
            <select value={condition} onChange={(e) => setCondition(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded bg-[#0a0e1a] border border-slate-700 text-white text-xs outline-none"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input type="number" step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Price" className="flex-1 px-2 py-1.5 rounded bg-[#0a0e1a] border border-slate-700 text-white text-xs outline-none" required
            />
          </div>
          <button type="submit" className="w-full py-1.5 rounded bg-blue-600 text-white text-xs font-medium">Create</button>
        </form>
      )}

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/20">
            <div>
              <span className="text-xs font-medium text-white">{alert.symbol.replace(".NS", "")}</span>
              <span className={`text-[10px] ml-2 ${alert.condition === "above" ? "text-emerald-400" : "text-red-400"}`}>
                {alert.condition} {alert.target_price}
              </span>
              {!alert.is_active && (
                <span className="text-[10px] ml-2 text-yellow-400">triggered</span>
              )}
            </div>
            <button onClick={() => handleDelete(alert.id)} className="text-slate-500 hover:text-red-400">
              <HiTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-xs text-slate-500">No alerts set</p>}
      </div>
    </div>
  );
}
