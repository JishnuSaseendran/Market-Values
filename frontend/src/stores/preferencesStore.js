import { create } from "zustand";
import api from "../lib/api";

const usePreferencesStore = create((set) => ({
  preferences: null,
  loading: false,

  fetchPreferences: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/preferences");
      set({ preferences: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updatePreferences: async (data) => {
    try {
      const res = await api.put("/preferences", data);
      set({ preferences: res.data });
    } catch {
      // ignore
    }
  },
}));

export default usePreferencesStore;
