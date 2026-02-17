import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function UpstoxCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      toast.error("No authorization code received");
      setTimeout(() => navigate("/settings"), 2000);
      return;
    }

    const exchangeCode = async () => {
      try {
        await api.get(`/upstox/callback?code=${encodeURIComponent(code)}`);
        setStatus("success");
        toast.success("Upstox account linked successfully!");
        setTimeout(() => navigate("/settings"), 1500);
      } catch (err) {
        setStatus("error");
        toast.error(err.response?.data?.detail || "Failed to link Upstox account");
        setTimeout(() => navigate("/settings"), 2000);
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#070b18] flex items-center justify-center">
      <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-8 text-center max-w-sm">
        {status === "processing" && (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Linking Upstox Account...</p>
            <p className="text-slate-500 text-sm mt-1">Please wait</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Account Linked!</p>
            <p className="text-slate-500 text-sm mt-1">Redirecting to settings...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white font-medium">Linking Failed</p>
            <p className="text-slate-500 text-sm mt-1">Redirecting to settings...</p>
          </>
        )}
      </div>
    </div>
  );
}
