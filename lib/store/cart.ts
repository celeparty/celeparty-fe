import { create } from "zustand";
import _ from "lodash";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCart = create(
	persist(
		(set, get) => ({
			cart: [],
			cartLength: 0,
			setCartLength: () => {
				set((state: { cartLength: number }) => ({
					cartLength: state.cartLength + 1,
				}));
			},
			setCart: (data: any) =>
				set((state: { cart: any }) => ({
					cart: [...state.cart, ...data],
				})),
			test: () => console.log("test"),
		}),
		{
			name: "cart",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
