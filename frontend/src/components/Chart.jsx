import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import api from "../lib/api";
import useThemeStore from "../stores/themeStore";

const INDICATOR_COLORS = {
  sma_20: "#f59e0b",
  ema_20: "#8b5cf6",
  bollinger_upper: "#6366f1",
  bollinger_middle: "#6366f1",
  bollinger_lower: "#6366f1",
  macd_line: "#3b82f6",
  macd_signal: "#f97316",
  macd_histogram: "#94a3b8",
  rsi_14: "#ec4899",
};

export default function Chart({ symbol, interval = "5m", indicators = [] }) {
  const chartContainer = useRef();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const container = chartContainer.current;
    if (!container) return;

    const isDark = theme === "dark";
    const bgColor = isDark ? "transparent" : "#ffffff";
    const textColor = isDark ? "#64748b" : "#94a3b8";
    const gridColor = isDark ? "#1e293b" : "#e2e8f0";
    const borderColor = isDark ? "#1e293b" : "#e2e8f0";

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { color: bgColor },
        textColor,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "#475569", width: 1, style: 2, labelBackgroundColor: "#334155" },
        horzLine: { color: "#475569", width: 1, style: 2, labelBackgroundColor: "#334155" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor,
      },
      rightPriceScale: { borderColor },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    // Volume
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const indicatorParam = indicators.length > 0 ? `&indicators=${indicators.join(",")}` : "";
    api.get(`/stocks/candles/${symbol}?interval=${interval}${indicatorParam}`)
      .then((res) => {
        const data = res.data.data;
        if (!data || data.length === 0) return;

        const formatted = data.map((item) => ({
          time: Math.floor(new Date(item.Datetime).getTime() / 1000),
          open: item.Open,
          high: item.High,
          low: item.Low,
          close: item.Close,
        }));
        candleSeries.setData(formatted);

        // Volume bars
        const volumeData = data.map((item) => ({
          time: Math.floor(new Date(item.Datetime).getTime() / 1000),
          value: item.Volume,
          color: item.Close >= item.Open ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
        }));
        volumeSeries.setData(volumeData);

        // Indicators
        const indData = res.data.indicators || {};
        Object.entries(indData).forEach(([key, points]) => {
          if (!points || points.length === 0) return;
          const color = INDICATOR_COLORS[key] || "#94a3b8";
          const series = chart.addLineSeries({
            color,
            lineWidth: 1,
            title: key,
            priceScaleId: key.startsWith("rsi") ? "rsi" : key.startsWith("macd") ? "macd" : "",
          });
          series.setData(points);
        });

        chart.timeScale().fitContent();
      })
      .catch((err) => console.error("Failed to fetch candle data:", err));

    const handleResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, interval, indicators.join(","), theme]);

  return <div ref={chartContainer} className="w-full" />;
}
