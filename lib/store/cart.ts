import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CartItem } from "@/lib/interfaces/iCart";

interface NotifState {
	statusNotif: boolean;
	message?: string | null;
	notifCart: (message: string) => void;
  }

export interface CartStore {
  cart: CartItem[];
  cartLength: number;
  setCartLength: () => void;
  setCart: (data: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  updateNote: (productId: string | number, newNote: string) => void;
  updateQuantity: (productId: string | number, newQuantity: number) => void;
  deleteItem: (productId: string | number) => void;
  calculateTotal: () => number;
  test?: () => void;
}

export const useCart = create<CartStore>()(
  persist<CartStore>(
    (set, get) => ({
      cart: [] as CartItem[],
      cartLength: 0,
      setCartLength: () => {
        set((state) => ({
          cartLength: state.cartLength + 1,
        }));
      },
      setCart: (data) => {
        set((state) => {
          let newCart: CartItem[];
          if (typeof data === 'function') {
            newCart = data(state.cart);
          } else {
            newCart = data;
          }
          return { cart: newCart };
        });
      },
      updateNote: (productId, newNote) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product_id === productId ? { ...item, note: newNote } : item
          ),
        }));
      },
      updateQuantity: (productId, newQuantity) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product_id === productId ? { ...item, quantity: newQuantity } : item
          ),
        }));
      },
      deleteItem: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product_id !== productId),
        }));
      },
      calculateTotal: () => {
        const cart = get().cart;
        return cart.reduce((total, item) => {
          return total + (item.price * item.quantity || 0);
        }, 0);
      },
      
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
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