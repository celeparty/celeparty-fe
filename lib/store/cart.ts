import { CartItem, TicketRecipient } from "@/lib/interfaces/iCart";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotifState {
	statusNotif: boolean;
	message?: string | null;
	notifCart: (message: string) => void;
}

interface CartStore {
	cart: CartItem[];
	cartLength: number;
	selectedItems: (string | number)[]; // Array of selected product_ids
	setCartLength: () => void;
	setCart: (data: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
	updateNote: (productId: string | number, newNote: string) => void;
	updateQuantity: (productId: string | number, newQuantity: number) => void;
	deleteItem: (productId: string | number) => void;
	calculateTotal: () => number;
	hasMixedProducts: () => boolean; // Check if cart has both tickets and equipment
	addItem: (item: CartItem) => boolean; // Add item with validation
	updateRecipients: (productId: string | number, recipients: TicketRecipient[]) => void;
	updateProductDetails: (
		productId: string | number,
		details: {
			customer_name?: string;
			event_date?: string;
			shipping_location?: string;
			loading_date?: string;
			loading_time?: string;
		},
	) => void;
	selectItem: (productId: string | number) => void;
	deselectItem: (productId: string | number) => void;
	clearSelection: () => void;
	getSelectedItems: () => CartItem[];
	validateSelection: () => boolean; // Ensure selected items are of same type
	test?: () => void;
}

export const useCart = create<CartStore>()(
	persist<CartStore>(
		(set, get) => ({
			cart: [] as CartItem[],
			cartLength: 0,
			selectedItems: [] as (string | number)[],
			setCartLength: () => {
				set((state) => ({
					cartLength: state.cartLength + 1,
				}));
			},
			setCart: (data) => {
				set((state) => {
					let newCart: CartItem[];
					if (typeof data === "function") {
						newCart = data(state.cart);
					} else {
						newCart = data;
					}
					return { cart: newCart };
				});
			},
			updateNote: (productId, newNote) => {
				set((state) => ({
					cart: state.cart.map((item) => (item.product_id === productId ? { ...item, note: newNote } : item)),
				}));
			},
			updateQuantity: (productId, newQuantity) => {
				set((state) => ({
					cart: state.cart.map((item) =>
						item.product_id === productId ? { ...item, quantity: newQuantity } : item,
					),
				}));
			},
			deleteItem: (productId) => {
				set((state) => ({
					cart: state.cart.filter((item) => item.product_id !== productId),
					selectedItems: state.selectedItems.filter((id) => id !== productId), // Remove from selection if deleted
				}));
			},
			calculateTotal: () => {
				const cart = get().cart;
				return cart.reduce((total, item) => {
					return total + (item.price * item.quantity || 0);
				}, 0);
			},
			hasMixedProducts: () => {
				const cart = get().cart;
				const productTypes = cart.map((item) => item.product_type).filter(Boolean);
				return new Set(productTypes).size > 1;
			},
			addItem: (item: CartItem) => {
				const cart = get().cart;
				const existingItem = cart.find((cartItem) => cartItem.product_id === item.product_id);

				// Check if adding this item would create mixed products
				if (cart.length > 0) {
					const firstItemType = cart[0].product_type;
					if (firstItemType && item.product_type && firstItemType !== item.product_type) {
						return false; // Cannot mix ticket and equipment
					}
				}

				if (existingItem) {
					// Update quantity if item already exists
					set((state) => ({
						cart: state.cart.map((cartItem) =>
							cartItem.product_id === item.product_id
								? { ...cartItem, quantity: cartItem.quantity + item.quantity }
								: cartItem,
						),
					}));
				} else {
					// Add new item
					set((state) => ({
						cart: [...state.cart, item],
					}));
				}
				return true;
			},
			updateRecipients: (productId, recipients) => {
				set((state) => ({
					cart: state.cart.map((item) => (item.product_id === productId ? { ...item, recipients } : item)),
				}));
			},

			updateProductDetails: (
				productId: string | number,
				details: {
					customer_name?: string;
					event_date?: string;
					shipping_location?: string;
					loading_date?: string;
					loading_time?: string;
				},
			) => {
				set((state) => ({
					cart: state.cart.map((item) =>
						item.product_id === productId ? { ...item, ...details } : item
					),
				}));
			},

			selectItem: (productId) => {
				set((state) => ({
					selectedItems: state.selectedItems.includes(productId)
						? state.selectedItems
						: [...state.selectedItems, productId], // Ensure no duplicates
				}));
			},
			deselectItem: (productId) => {
				set((state) => ({
					selectedItems: state.selectedItems.filter((id) => id !== productId),
				}));
			},
			clearSelection: () => {
				set({ selectedItems: [] });
			},
			getSelectedItems: () => {
				const state = get();
				return state.cart.filter((item) => state.selectedItems.includes(item.product_id));
			},
			validateSelection: () => {
				const selectedItems = get().getSelectedItems();
				if (selectedItems.length === 0) return false;
				const productTypes = selectedItems.map((item) => item.product_type).filter(Boolean);
				return new Set(productTypes).size === 1; // All selected items must be of same type
			},
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
