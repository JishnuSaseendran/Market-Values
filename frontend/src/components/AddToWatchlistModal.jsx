import { useState } from "react";
import { HiX } from "react-icons/hi";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function AddToWatchlistModal({ watchlistId, onClose, onAdded }) {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!watchlistId) return;
    setLoading(true);
    try {
      const sym = symbol.toUpperCase().endsWith(".NS") ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;
      await api.post(`/watchlists/${watchlistId}/items`, { symbol: sym });
      toast.success("Added to watchlist");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Add to Watchlist</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><HiX className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. RELIANCE or RELIANCE.NS"
            className="w-full px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            required autoFocus
          />
          <button type="submit" disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}
