import { useEffect } from "react";
import useUpstoxStore from "../stores/upstoxStore";
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

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-300">Upstox Account</p>
        {linked && (
          <p className="text-xs text-emerald-400 mt-0.5">Connected</p>
        )}
      </div>
      {linked ? (
        <button
          onClick={handleUnlink}
          className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition"
        >
          Unlink
        </button>
      ) : (
        <button
          onClick={handleLink}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          Link Upstox
        </button>
      )}
    </div>
  );
}
