import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import useThemeStore from "../stores/themeStore";

export default function PredictionChart({ historical, predicted, confidenceBand }) {
  const containerRef = useRef();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !historical?.length) return;

    const isDark = theme === "dark";
    const bgColor = isDark ? "#0f172a" : "#ffffff";
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
        timeVisible: false,
        secondsVisible: false,
        borderColor,
      },
      rightPriceScale: { borderColor },
    });

    // Confidence band — two overlapping area series trick:
    // 1) upper area fills from upper-bound DOWN with band colour
    // 2) lower area fills from lower-bound DOWN with bg colour, erasing everything below
    if (confidenceBand?.length) {
      const upperArea = chart.addAreaSeries({
        topColor: "rgba(139,92,246,0.28)",
        bottomColor: "rgba(139,92,246,0.08)",
        lineColor: "rgba(139,92,246,0.7)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "",
      });

      const lowerArea = chart.addAreaSeries({
        topColor: bgColor,
        bottomColor: bgColor,
        lineColor: "rgba(139,92,246,0.7)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "",
      });

      upperArea.setData(confidenceBand.map((d) => ({ time: d.time, value: d.upper })));
      lowerArea.setData(confidenceBand.map((d) => ({ time: d.time, value: d.lower })));
    }

    // Historical line (blue)
    const historicalSeries = chart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 2,
      title: "Actual",
      priceLineVisible: false,
    });
    historicalSeries.setData(historical.map((d) => ({ time: d.time, value: d.value })));

    // Predicted line (violet, dashed)
    const predictedSeries = chart.addLineSeries({
      color: "#8b5cf6",
      lineWidth: 2,
      lineStyle: 1, // dashed
      title: "Predicted",
      priceLineVisible: false,
    });

    // Bridge: connect last historical point to first predicted
    const bridgeData = [];
    if (historical.length && predicted?.length) {
      bridgeData.push({ time: historical[historical.length - 1].time, value: historical[historical.length - 1].value });
    }
    predictedSeries.setData([
      ...bridgeData,
      ...predicted.map((d) => ({ time: d.time, value: d.value })),
    ]);

    // Vertical marker at "Today" boundary
    if (historical.length) {
      const todayTime = historical[historical.length - 1].time;
      historicalSeries.createPriceLine({
        price: 0,
        color: "transparent",
      });
      chart.timeScale().setVisibleRange({
        from: historical[0].time,
        to: predicted?.length ? predicted[predicted.length - 1].time : todayTime,
      });
    }

    chart.timeScale().fitContent();

    const handleResize = () => chart.applyOptions({ width: container.clientWidth });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [historical, predicted, confidenceBand, theme]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full" />
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500 rounded" />
          <span className="text-xs text-slate-400">Actual (90d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-violet-500 rounded border-dashed" style={{ borderTop: "2px dashed #8b5cf6", background: "none" }} />
          <span className="text-xs text-slate-400">Predicted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded" style={{ background: "rgba(139,92,246,0.2)" }} />
          <span className="text-xs text-slate-400">Confidence Band</span>
        </div>
      </div>
    </div>
  );
}
