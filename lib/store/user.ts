import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUser = create(
	persist(
		(set, get) => ({
			userMe: [],
			setUserMe: (data:any)=> {
				set({ userMe: data })
			}
		}),
		{
			name: "userMe",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
