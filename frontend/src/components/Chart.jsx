import { useEffect, useRef } from "react";
import axios from "axios";
import { createChart } from "lightweight-charts";

export default function Chart({ symbol }) {
  const chartContainer = useRef();

  useEffect(() => {
    const container = chartContainer.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
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
      crosshair: {
        mode: 0,
        vertLine: { color: "#475569", width: 1, style: 2, labelBackgroundColor: "#334155" },
        horzLine: { color: "#475569", width: 1, style: 2, labelBackgroundColor: "#334155" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#1e293b",
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    axios.get(`/candles/${symbol}`)
      .then(res => {
        if (!res.data.data) return;
        const formatted = res.data.data.map(item => ({
          time: Math.floor(new Date(item.Datetime).getTime() / 1000),
          open: item.Open,
          high: item.High,
          low: item.Low,
          close: item.Close,
        }));

        candleSeries.setData(formatted);
        chart.timeScale().fitContent();
      })
      .catch(err => console.error("Failed to fetch candle data:", err));

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol]);

  return <div ref={chartContainer} className="w-full" />;
}
