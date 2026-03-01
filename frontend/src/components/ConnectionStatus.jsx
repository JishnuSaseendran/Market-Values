import useStockStore from "../stores/stockStore";
import useAuthStore from "../stores/authStore";
import ThemeToggle from "./ThemeToggle";

export default function ConnectionStatus() {
  const connected = useStockStore((s) => s.connected);
  const { user, logout } = useAuthStore();

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {connected && (
            <span className="animate-dot-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              connected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400"
            }`}
          />
        </span>
        <span className="text-xs text-slate-400">
          {connected ? "Live" : "Disconnected"}
        </span>
      </div>
      {user && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-slate-400">{user.username}</span>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
