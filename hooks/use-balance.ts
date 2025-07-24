import { create } from "zustand";

interface BalanceState {
  activeBalance: string;
  refundBalance: string;
  setActiveBalance: (amount: string) => void;
  setRefundBalance: (amount: string) => void;
  resetBalances: () => void;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  activeBalance: "0",
  refundBalance: "0",
  setActiveBalance: (amount) => set({ activeBalance: amount }),
  setRefundBalance: (amount) => set({ refundBalance: amount }),
  resetBalances: () => set({ activeBalance: "0", refundBalance: "0" }),
}));
