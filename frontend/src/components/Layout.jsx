import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { HiMenu, HiX } from "react-icons/hi";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ConnectionStatus from "./ConnectionStatus";
import useStockStore from "../stores/stockStore";

const pageMeta = {
  "/": { title: "Market Overview", subtitle: "Indian Stock Exchange - NSE" },
  "/market": { title: "Market", subtitle: "Stocks & Sectors" },
  "/heatmap": { title: "Heatmap", subtitle: "Visual Market Performance" },
  "/compare": { title: "Compare", subtitle: "Side-by-Side Analysis" },
  "/portfolio": { title: "Portfolio", subtitle: "Your Holdings" },
  "/trading": { title: "Trading", subtitle: "Live Orders & Positions" },
  "/settings": { title: "Settings", subtitle: "Preferences" },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stocks, selected, setSelected } = useStockStore();
  const location = useLocation();

  const meta = pageMeta[location.pathname] || pageMeta["/"];
  const isTrading = location.pathname === "/trading";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e1a]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar stocks={stocks} selected={selected} setSelected={setSelected} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <Dialog open={sidebarOpen} onClose={() => setSidebarOpen(false)} className="relative z-50 md:hidden">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 left-0 w-72 z-50">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
          >
            <HiX className="w-5 h-5" />
          </button>
          <Sidebar
            stocks={stocks}
            selected={selected}
            setSelected={(s) => { setSelected(s); setSidebarOpen(false); }}
          />
        </Dialog.Panel>
      </Dialog>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <HiMenu className="w-6 h-6" />
            </button>
            <div key={location.pathname} className="animate-slide-in-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{meta.title}</h1>
                {isTrading && (
                  <span className="text-[10px] font-bold bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full tracking-wider">
                    UPSTOX
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>
          <ConnectionStatus />
        </header>

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
