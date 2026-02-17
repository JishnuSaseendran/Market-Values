import { NavLink } from "react-router-dom";
import { HiHome, HiCollection, HiBell, HiCog, HiChartBar, HiSwitchHorizontal } from "react-icons/hi";

const navItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/market", icon: HiChartBar, label: "Market" },
  { to: "/portfolio", icon: HiCollection, label: "Portfolio" },
  { to: "/trading", icon: HiSwitchHorizontal, label: "Trading" },
  { to: "/settings", icon: HiCog, label: "Settings" },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0b1022] border-t border-slate-800/60 z-40">
      <div className="flex justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition ${
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
