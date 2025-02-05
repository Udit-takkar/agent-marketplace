import { create } from "zustand";
import { Transaction, Alert } from "@/types/risk";

interface RiskStore {
  transactions: Transaction[];
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Transaction) => void;
  addAlert: (alert: Alert) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAlerts: () => void;
}

export const useRiskStore = create<RiskStore>((set) => ({
  transactions: [],
  alerts: [],
  isLoading: false,
  error: null,
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions].slice(0, 10),
    })),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 5),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearAlerts: () => set({ alerts: [] }),
}));
