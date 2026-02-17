import { create } from "zustand";
import toast from "react-hot-toast";

const useAlertStore = create((set) => ({
  alerts: [],
  triggered: [],

  addTriggered: (alert) => {
    set((s) => ({ triggered: [alert, ...s.triggered] }));

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: `${alert.symbol} is ${alert.condition} ${alert.target_price} (now ${alert.current_price})`,
      });
    }

    // Toast notification
    toast(`${alert.symbol} hit ${alert.condition} ${alert.target_price}!`, {
      icon: alert.condition === "above" ? "\u2B06\uFE0F" : "\u2B07\uFE0F",
      duration: 5000,
    });
  },

  requestNotificationPermission: () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  },
}));

export default useAlertStore;
