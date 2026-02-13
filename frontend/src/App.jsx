import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TickerCard from "./components/TickerCard";
import Chart from "./components/Chart";

const WS_URL = `ws://${window.location.host}/ws/stocks`;

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState("RELIANCE.NS");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      setStocks(JSON.parse(event.data));
    };

    return () => ws.close();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar stocks={stocks} selected={selected} setSelected={setSelected} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Market Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">Indian Stock Exchange - NSE</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                connected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"
              }`}
            />
            <span className="text-xs text-slate-400">
              {connected ? "Live" : "Disconnected"}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Ticker Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {stocks.map((stock) => (
              <TickerCard
                key={stock.symbol}
                stock={stock}
                isSelected={stock.symbol === selected}
                onClick={() => setSelected(stock.symbol)}
              />
            ))}
          </div>

          {/* Chart */}
          <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{selected.replace(".NS", "")}</h2>
                <p className="text-xs text-slate-500">Intraday - 5 min intervals</p>
              </div>
            </div>
            <Chart symbol={selected} />
          </div>
        </div>
      </div>
    </div>
  );
}
