import { useState } from "react";
import { HiX } from "react-icons/hi";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function PortfolioForm({ entry, onClose, onSave }) {
  const [symbol, setSymbol] = useState(entry?.symbol || "");
  const [buyPrice, setBuyPrice] = useState(entry?.buy_price || "");
  const [quantity, setQuantity] = useState(entry?.quantity || "");
  const [buyDate, setBuyDate] = useState(entry?.buy_date || "");
  const [notes, setNotes] = useState(entry?.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        symbol: symbol.toUpperCase().endsWith(".NS") ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`,
        buy_price: parseFloat(buyPrice),
        quantity: parseInt(quantity),
        buy_date: buyDate || null,
        notes: notes || null,
      };

      if (entry) {
        await api.put(`/portfolio/${entry.id}`, data);
        toast.success("Entry updated");
      } else {
        await api.post("/portfolio", data);
        toast.success("Entry added");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{entry ? "Edit" : "Add"} Portfolio Entry</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><HiX className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Symbol</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} required
              placeholder="e.g. RELIANCE"
              className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Buy Price</label>
              <input type="number" step="0.01" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Buy Date</label>
            <input type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? "Saving..." : entry ? "Update" : "Add Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
