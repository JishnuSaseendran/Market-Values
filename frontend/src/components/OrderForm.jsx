import { useState } from "react";
import useUpstoxStore from "../stores/upstoxStore";
import toast from "react-hot-toast";

export default function OrderForm({ onOrderPlaced }) {
  const { placeOrder } = useUpstoxStore();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    symbol: "",
    transaction_type: "BUY",
    order_type: "MARKET",
    product: "CNC",
    qty: 1,
    price: "",
    trigger_price: "",
    validity: "DAY",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.symbol.trim()) {
      toast.error("Symbol is required");
      return;
    }
    if (form.qty < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    setShowConfirm(true);
  };

  const confirmOrder = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        trigger_price: form.trigger_price ? parseFloat(form.trigger_price) : null,
      };
      const result = await placeOrder(payload);
      if (result.status === "success") {
        toast.success(`Order placed: ${result.order_id}`);
        onOrderPlaced?.();
      } else {
        toast.error(result.message || "Order failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const needsPrice = ["LIMIT", "SL"].includes(form.order_type);
  const needsTrigger = ["SL", "SL-M"].includes(form.order_type);

  return (
    <div className="bg-[#0f1629] rounded-xl border border-slate-800/60 p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Place Order</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Instrument (e.g. NSE_EQ|RELIANCE)"
          value={form.symbol}
          onChange={(e) => handleChange("symbol", e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 text-sm text-white border border-slate-700 outline-none focus:border-blue-500"
        />

        {/* Transaction Type */}
        <div className="flex gap-2">
          {["BUY", "SELL"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleChange("transaction_type", t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                form.transaction_type === t
                  ? t === "BUY"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Order Type */}
        <div className="grid grid-cols-4 gap-1.5">
          {["MARKET", "LIMIT", "SL", "SL-M"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleChange("order_type", t)}
              className={`py-1.5 rounded text-xs font-medium transition ${
                form.order_type === t
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Product */}
        <div className="grid grid-cols-3 gap-1.5">
          {["CNC", "MIS", "D"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleChange("product", p)}
              className={`py-1.5 rounded text-xs font-medium transition ${
                form.product === p
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {p === "CNC" ? "Delivery" : p === "MIS" ? "Intraday" : "Day"}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Quantity"
          min="1"
          value={form.qty}
          onChange={(e) => handleChange("qty", parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 text-sm text-white border border-slate-700 outline-none focus:border-blue-500"
        />

        {needsPrice && (
          <input
            type="number"
            step="0.05"
            placeholder="Price"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 text-sm text-white border border-slate-700 outline-none focus:border-blue-500"
          />
        )}

        {needsTrigger && (
          <input
            type="number"
            step="0.05"
            placeholder="Trigger Price"
            value={form.trigger_price}
            onChange={(e) => handleChange("trigger_price", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 text-sm text-white border border-slate-700 outline-none focus:border-blue-500"
          />
        )}

        {/* Validity */}
        <div className="flex gap-2">
          {["DAY", "IOC"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleChange("validity", v)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition ${
                form.validity === v
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
            form.transaction_type === "BUY"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          } disabled:opacity-50`}
        >
          {submitting ? "Placing..." : `${form.transaction_type} Order`}
        </button>
      </form>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f1629] border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h4 className="text-white font-semibold mb-3">Confirm Order</h4>
            <div className="space-y-2 text-sm text-slate-300 mb-5">
              <p><span className="text-slate-500">Symbol:</span> {form.symbol}</p>
              <p><span className="text-slate-500">Type:</span> {form.transaction_type} {form.order_type}</p>
              <p><span className="text-slate-500">Qty:</span> {form.qty}</p>
              {needsPrice && <p><span className="text-slate-500">Price:</span> {form.price}</p>}
              {needsTrigger && <p><span className="text-slate-500">Trigger:</span> {form.trigger_price}</p>}
              <p><span className="text-slate-500">Product:</span> {form.product}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmOrder}
                className={`flex-1 py-2 rounded-lg text-white text-sm font-medium transition ${
                  form.transaction_type === "BUY"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm {form.transaction_type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
