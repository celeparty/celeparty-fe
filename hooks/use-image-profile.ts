import { create } from "zustand";

interface iImageState {
  profileImageUrl: string | File | null;
  setProfileImageUrl: (url: string | null) => void;
  clearProfileImageUrl: () => void;
}

export const useImageProfileStore = create<iImageState>((set) => ({
  profileImageUrl: null,
  setProfileImageUrl: (url) => set({ profileImageUrl: url }),
  clearProfileImageUrl: () => set({ profileImageUrl: null }),
}));
