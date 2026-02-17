import { useEffect, useState } from "react";
import api from "../lib/api";
import IndexCard from "../components/IndexCard";
import GainersLosersTable from "../components/GainersLosersTable";

export default function MarketOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/market/overview");
        setData(res.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading market data...</div>;
  if (!data) return <div className="p-8 text-slate-500">Failed to load market data</div>;

  return (
    <div className="p-4 md:p-8">
      {/* Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {data.indices?.map((idx) => (
          <IndexCard key={idx.symbol} data={idx} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GainersLosersTable title="Top Gainers" stocks={data.gainers} />
        <GainersLosersTable title="Top Losers" stocks={data.losers} isLoser />
        <GainersLosersTable title="Most Active" stocks={data.most_active} />
      </div>
    </div>
  );
}
