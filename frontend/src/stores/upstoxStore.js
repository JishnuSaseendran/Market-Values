import { create } from "zustand";
import api from "../lib/api";

const useUpstoxStore = create((set, get) => ({
  linked: false,
  loading: false,
  profile: null,
  funds: null,
  holdings: [],
  positions: [],
  orders: [],
  trades: [],

  checkStatus: async () => {
    try {
      const res = await api.get("/upstox/status");
      set({ linked: res.data.linked });
      return res.data;
    } catch {
      set({ linked: false });
      return { linked: false };
    }
  },

  getAuthUrl: async () => {
    const res = await api.get("/upstox/auth-url");
    return res.data.url;
  },

  unlink: async () => {
    await api.delete("/upstox/unlink");
    set({
      linked: false,
      profile: null,
      funds: null,
      holdings: [],
      positions: [],
      orders: [],
      trades: [],
    });
  },

  fetchProfile: async () => {
    try {
      const res = await api.get("/upstox/profile");
      set({ profile: res.data });
    } catch {
      set({ profile: null });
    }
  },

  fetchFunds: async () => {
    try {
      const res = await api.get("/upstox/funds");
      set({ funds: res.data });
    } catch {
      set({ funds: null });
    }
  },

  fetchHoldings: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/upstox/holdings");
      set({ holdings: res.data, loading: false });
    } catch {
      set({ holdings: [], loading: false });
    }
  },

  fetchPositions: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/upstox/positions");
      set({ positions: res.data, loading: false });
    } catch {
      set({ positions: [], loading: false });
    }
  },

  fetchOrders: async () => {
    try {
      const res = await api.get("/upstox/orders");
      set({ orders: res.data });
    } catch {
      set({ orders: [] });
    }
  },

  fetchTrades: async () => {
    try {
      const res = await api.get("/upstox/trades");
      set({ trades: res.data });
    } catch {
      set({ trades: [] });
    }
  },

  placeOrder: async (orderData) => {
    const res = await api.post("/upstox/orders", orderData);
    return res.data;
  },

  modifyOrder: async (orderId, orderData) => {
    const res = await api.put(`/upstox/orders/${orderId}`, orderData);
    return res.data;
  },

  cancelOrder: async (orderId) => {
    const res = await api.delete(`/upstox/orders/${orderId}`);
    return res.data;
  },
}));

export default useUpstoxStore;
