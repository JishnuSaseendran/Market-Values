import { useEffect, useState } from "react";
import api from "../lib/api";
import SectorHeatmapCell from "../components/SectorHeatmapCell";

export default function HeatmapPage() {
  const [sectors, setSectors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/market/sectors");
        setSectors(res.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading heatmap...</div>;
  if (!sectors) return <div className="p-8 text-slate-500">Failed to load sector data</div>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Sector Heatmap</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(sectors).map(([sector, data]) => (
          <div key={sector} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">{sector}</span>
              <span className={`text-xs font-bold ${data.avg_change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {data.avg_change >= 0 ? "+" : ""}{data.avg_change}%
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {data.stocks?.map((stock) => (
                <SectorHeatmapCell key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
