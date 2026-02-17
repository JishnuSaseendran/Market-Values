import useStockStore from "../stores/stockStore";
import TickerCard from "../components/TickerCard";
import Chart from "../components/Chart";
import TimeframeSelector from "../components/TimeframeSelector";
import NewsFeed from "../components/NewsFeed";
import { useState } from "react";

export default function DashboardPage() {
  const { stocks, selected, setSelected } = useStockStore();
  const [interval, setInterval] = useState("5m");
  const [indicators, setIndicators] = useState([]);

  return (
    <div className="p-4 md:p-8">
      {/* Ticker Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        {stocks.slice(0, 10).map((stock) => (
          <TickerCard
            key={stock.symbol}
            stock={stock}
            isSelected={stock.symbol === selected}
            onClick={() => setSelected(stock.symbol)}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{selected.replace(".NS", "")}</h2>
            <p className="text-xs text-slate-500">
              {interval === "5m" ? "Intraday" : interval} intervals
            </p>
          </div>
          <TimeframeSelector
            value={interval}
            onChange={setInterval}
            indicators={indicators}
            onIndicatorsChange={setIndicators}
          />
        </div>
        <Chart symbol={selected} interval={interval} indicators={indicators} />
      </div>

      {/* News */}
      <NewsFeed symbol={selected} />
    </div>
  );
}
