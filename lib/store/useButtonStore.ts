import { create } from "zustand";

type Button = {
	activeButton: string | null;
	setActiveButton: (button: string) => void;
};

const useButtonStore = create<Button>((set) => ({
	activeButton: null,
	setActiveButton: (button: string) => set((state) => ({ activeButton: state.activeButton ? null : button })),
}));

export default useButtonStore;
