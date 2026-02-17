import { useState, useEffect, useRef } from "react";
import { HiSearch } from "react-icons/hi";
import api from "../lib/api";
import useStockStore from "../stores/stockStore";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const setSelected = useStockStore((s) => s.setSelected);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0e1a] border border-slate-700/50">
        <HiSearch className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search stocks..."
          className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111827] border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => {
                setSelected(r.symbol);
                setQuery("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 hover:bg-slate-800 transition flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-white">{r.symbol.replace(".NS", "")}</p>
                <p className="text-xs text-slate-500">{r.name}</p>
              </div>
              {r.sector && (
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{r.sector}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
