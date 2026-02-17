import { useEffect, useState } from "react";
import { HiPlus, HiTrash, HiChevronDown } from "react-icons/hi";
import api from "../lib/api";
import useAuthStore from "../stores/authStore";
import AddToWatchlistModal from "./AddToWatchlistModal";

export default function WatchlistManager({ onSelectSymbol }) {
  const { token } = useAuthStore();
  const [watchlists, setWatchlists] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const fetchWatchlists = async () => {
    if (!token) return;
    try {
      const res = await api.get("/watchlists");
      setWatchlists(res.data);
      if (res.data.length > 0 && !activeId) setActiveId(res.data[0].id);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchWatchlists(); }, [token]);

  const activeWatchlist = watchlists.find((w) => w.id === activeId);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post("/watchlists", { name: newName });
      setNewName("");
      setShowCreate(false);
      fetchWatchlists();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/watchlists/${id}`);
      fetchWatchlists();
    } catch { /* ignore */ }
  };

  const handleRemoveItem = async (itemId) => {
    if (!activeId) return;
    try {
      await api.delete(`/watchlists/${activeId}/items/${itemId}`);
      fetchWatchlists();
    } catch { /* ignore */ }
  };

  if (!token) return null;

  return (
    <div className="px-3 pb-3">
      <div className="flex items-center justify-between px-2 mb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Watchlists</p>
        <div className="flex gap-1">
          <button onClick={() => setShowAdd(true)} className="text-slate-500 hover:text-white transition" title="Add stock">
            <HiPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Watchlist Selector */}
      <div className="flex items-center gap-1 px-2 mb-2">
        <select
          value={activeId || ""}
          onChange={(e) => setActiveId(Number(e.target.value))}
          className="flex-1 text-xs bg-slate-800/50 text-white rounded px-2 py-1 outline-none border-none"
        >
          {watchlists.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <button onClick={() => setShowCreate(!showCreate)} className="text-slate-500 hover:text-white" title="New watchlist">
          <HiPlus className="w-3 h-3" />
        </button>
        {activeId && (
          <button onClick={() => handleDelete(activeId)} className="text-slate-500 hover:text-red-400" title="Delete watchlist">
            <HiTrash className="w-3 h-3" />
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="px-2 mb-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Watchlist name"
            className="w-full px-2 py-1 text-xs bg-[#0a0e1a] border border-slate-700 rounded text-white outline-none"
            autoFocus
          />
        </form>
      )}

      {/* Watchlist Items */}
      {activeWatchlist?.items?.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer group"
          onClick={() => onSelectSymbol(item.symbol)}
        >
          <span className="text-xs text-slate-300">{item.symbol.replace(".NS", "")}</span>
          <button
            onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
          >
            <HiTrash className="w-3 h-3" />
          </button>
        </div>
      ))}

      {showAdd && (
        <AddToWatchlistModal
          watchlistId={activeId}
          onClose={() => setShowAdd(false)}
          onAdded={fetchWatchlists}
        />
      )}
    </div>
  );
}
