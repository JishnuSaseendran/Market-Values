import { useEffect } from "react";
import useUpstoxStore from "../stores/upstoxStore";
import { HiLightningBolt } from "react-icons/hi";
import toast from "react-hot-toast";

export default function UpstoxConnect() {
  const { linked, checkStatus, getAuthUrl, unlink } = useUpstoxStore();

  useEffect(() => {
    checkStatus();
  }, []);

  const handleLink = async () => {
    try {
      const url = await getAuthUrl();
      window.open(url, "_blank", "width=600,height=700");
    } catch {
      toast.error("Failed to get Upstox auth URL");
    }
  };

  const handleUnlink = async () => {
    try {
      await unlink();
      toast.success("Upstox account unlinked");
    } catch {
      toast.error("Failed to unlink account");
    }
  };

  if (linked) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <HiLightningBolt className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-dot-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-300">Upstox Connected</p>
            <p className="text-[11px] text-emerald-500/70">Live trading enabled</p>
          </div>
        </div>
        <button
          onClick={handleUnlink}
          className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 text-xs font-medium hover:bg-red-600/20 transition-all duration-150"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center">
          <HiLightningBolt className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">Upstox Account</p>
          <p className="text-[11px] text-slate-500">Not connected</p>
        </div>
      </div>
      <button
        onClick={handleLink}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 transition-all duration-150"
      >
        Connect
      </button>
    </div>
  );
}
