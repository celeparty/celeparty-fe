import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUser = create(
	persist(
		(set, get) => ({
			userMe: [],
			setUserMe: (data: any) => {
				set({ userMe: data });
			},
		}),
		{
			name: "userMe",
			// guard against SSR: only use sessionStorage in browser
			storage: createJSONStorage(() => {
				if (typeof window === "undefined") {
					return null as any;
				}
				return sessionStorage;
			}),
		},
	),
);
