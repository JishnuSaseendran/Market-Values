import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import useStockStore from "./stores/stockStore";
import useThemeStore from "./stores/themeStore";
import useAlertStore from "./stores/alertStore";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PortfolioPage from "./pages/PortfolioPage";
import SettingsPage from "./pages/SettingsPage";
import MarketOverviewPage from "./pages/MarketOverviewPage";
import HeatmapPage from "./pages/HeatmapPage";
import ComparePage from "./pages/ComparePage";
import TradingPage from "./pages/TradingPage";
import UpstoxCallbackPage from "./pages/UpstoxCallbackPage";

export default function App() {
  const connect = useStockStore((s) => s.connect);
  const disconnect = useStockStore((s) => s.disconnect);
  const onAlert = useStockStore((s) => s.onAlert);
  const initTheme = useThemeStore((s) => s.initTheme);
  const addTriggered = useAlertStore((s) => s.addTriggered);
  const requestPermission = useAlertStore((s) => s.requestNotificationPermission);

  useEffect(() => {
    initTheme();
    connect();
    requestPermission();
    const unsub = onAlert(addTriggered);
    return () => { disconnect(); unsub(); };
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upstox/callback" element={<UpstoxCallbackPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/market" element={<MarketOverviewPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/trading" element={<TradingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
