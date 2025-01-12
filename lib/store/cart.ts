import _ from "lodash";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotifState {
	statusNotif: boolean;
	message?: string | null;
	notifCart: (message: string) => void;
  }

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
			setCart: (data: []) =>
				set((state: { cart: [] }) => ({
					cart: [...state.cart, ...data],
				})),
			updateQuantity: (productId:any, newQuantity:any) => {
				set((state:any) => ({
					cart: state.cart.map((item:any) =>
					item.product_id === productId
						? { ...item, quantity: newQuantity }
						: item
					),
				}));
				},				
				deleteItem: (productId:any) => {
					set((state:any) => ({
					  cart: state.cart.filter((item:any) => item.product_id !== productId),
					}));
				  },				
				  calculateTotal: () => {
					const cart = get() as any; // Type assertion agar get() diperlakukan sebagai `any`
					return cart.cart.reduce((total: number, item: any) => {
					  // Pastikan untuk memeriksa nested struktur
					  const product = item?.product_id ? item : item[0];
					  return total + (product.price * product.quantity || 0);
					}, 0);
				  },	
			test: () => console.log("test"),
		}),
		{
			name: "cart",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

export const useNotif = create<NotifState>((set) => ({
	statusNotif: false,
	message: null,
	notifCart: (message: string) => {
	  set({ statusNotif: true, message }); // Tampilkan notifikasi
	  setTimeout(() => {
		set({ statusNotif: false, message: null }); // Sembunyikan setelah 3 detik
	  }, 3000);
	},
  }));