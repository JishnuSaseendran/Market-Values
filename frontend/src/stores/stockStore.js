import { create } from "zustand";

const useStockStore = create((set, get) => ({
  stocks: [],
  selected: localStorage.getItem("selectedStock") || "RELIANCE.NS",
  connected: false,
  ws: null,
  upstoxWs: null,
  upstoxConnected: false,
  alertCallbacks: [],

  setSelected: (symbol) => {
    localStorage.setItem("selectedStock", symbol);
    set({ selected: symbol });
  },

  connect: () => {
    const wsUrl = `ws://${window.location.host}/ws/stocks`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => set({ connected: true });
    ws.onclose = () => {
      set({ connected: false, ws: null });
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (!get().ws) get().connect();
      }, 3000);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "prices") {
        set({ stocks: msg.data });
      } else if (msg.type === "alert") {
        get().alertCallbacks.forEach((cb) => cb(msg.data));
      } else if (Array.isArray(msg)) {
        // Legacy format
        set({ stocks: msg });
      }
    };

    set({ ws });
  },

  connectUpstox: () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = `ws://${window.location.host}/ws/upstox`;
    const upstoxWs = new WebSocket(wsUrl);

    upstoxWs.onopen = () => {
      upstoxWs.send(JSON.stringify({ token }));
    };

    upstoxWs.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "connected") {
        set({ upstoxConnected: true });
      } else if (msg.type === "market_data") {
        // Merge with existing stocks or handle separately
        // Upstox market data can be used to update prices
      } else if (msg.type === "order_update") {
        // Could dispatch to upstoxStore for order updates
      }
    };

    upstoxWs.onclose = () => {
      set({ upstoxConnected: false, upstoxWs: null });
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (!get().upstoxWs) get().connectUpstox();
      }, 5000);
    };

    set({ upstoxWs });
  },

  disconnectUpstox: () => {
    const { upstoxWs } = get();
    if (upstoxWs) {
      upstoxWs.close();
      set({ upstoxWs: null, upstoxConnected: false });
    }
  },

  subscribeUpstox: (instruments) => {
    const { upstoxWs } = get();
    if (upstoxWs && upstoxWs.readyState === WebSocket.OPEN) {
      upstoxWs.send(JSON.stringify({ type: "subscribe", instruments }));
    }
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null });
    }
    get().disconnectUpstox();
  },

  onAlert: (callback) => {
    set((s) => ({ alertCallbacks: [...s.alertCallbacks, callback] }));
    return () => {
      set((s) => ({ alertCallbacks: s.alertCallbacks.filter((cb) => cb !== callback) }));
    };
  },
}));

export default useStockStore;
