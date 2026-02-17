import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ComparisonChart({ data }) {
  const chartContainer = useRef();

  useEffect(() => {
    const container = chartContainer.current;
    if (!container || !data || data.length === 0) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      layout: {
        background: { color: "transparent" },
        textColor: "#64748b",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      rightPriceScale: { borderColor: "#1e293b" },
      timeScale: { borderColor: "#1e293b" },
    });

    data.forEach((item, i) => {
      if (item.normalized && item.normalized.length > 0) {
        const series = chart.addLineSeries({
          color: COLORS[i % COLORS.length],
          lineWidth: 2,
          title: item.stock.symbol.replace(".NS", ""),
        });
        series.setData(item.normalized);
      }
    });

    chart.timeScale().fitContent();

    const handleResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainer} className="w-full" />;
}
