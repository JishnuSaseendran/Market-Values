import { useEffect } from "react";
import usePreferencesStore from "../stores/preferencesStore";
import useThemeStore from "../stores/themeStore";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";
import UpstoxConnect from "../components/UpstoxConnect";

export default function SettingsPage() {
  const { preferences, fetchPreferences, updatePreferences } = usePreferencesStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchPreferences(); }, []);

  const handleUpdate = async (field, value) => {
    await updatePreferences({ [field]: value });
    toast.success("Preference updated");
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

      {/* Profile */}
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Profile</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Username</span>
            <span className="text-sm text-white">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Email</span>
            <span className="text-sm text-white">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Theme</span>
            <button
              onClick={() => {
                toggleTheme();
                handleUpdate("theme", theme === "dark" ? "light" : "dark");
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm text-white hover:bg-slate-700 transition"
            >
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          </div>

          {preferences && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Default Interval</span>
                <select
                  value={preferences.default_interval}
                  onChange={(e) => handleUpdate("default_interval", e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm text-white border-none outline-none"
                >
                  {["1m", "5m", "15m", "1h", "1d", "1wk", "1mo"].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Default Symbol</span>
                <input
                  type="text"
                  defaultValue={preferences.default_symbol}
                  onBlur={(e) => handleUpdate("default_symbol", e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm text-white border-none outline-none w-40 text-right"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Broker Integration */}
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Broker Integration</h3>
        <UpstoxConnect />
      </div>
    </div>
  );
}
