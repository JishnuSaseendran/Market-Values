import { NavLink } from "react-router-dom";
import { HiHome, HiCollection, HiChartBar, HiLightningBolt, HiSparkles } from "react-icons/hi";

const navItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/market", icon: HiChartBar, label: "Market" },
  { to: "/trading", icon: HiLightningBolt, label: "Trading", isTrading: true },
  { to: "/predict", icon: HiSparkles, label: "AI Predict" },
  { to: "/portfolio", icon: HiCollection, label: "Portfolio" },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b1022] border-t border-slate-800/60 z-40">
      <div className="flex justify-around items-end py-2">
        {navItems.map(({ to, icon: Icon, label, isTrading }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isTrading
                ? `flex flex-col items-center gap-0.5 -mt-3 transition-all duration-150`
                : `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-all duration-150 ${
                    isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                  }`
            }
          >
            {({ isActive }) =>
              isTrading ? (
                <>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30"
                        : "bg-gradient-to-br from-violet-600/80 to-indigo-700/80 shadow-violet-500/10"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-violet-400" : "text-slate-500"}`}>
                    {label}
                  </span>
                </>
              ) : (
                <>
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
