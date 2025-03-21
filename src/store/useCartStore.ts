import { create } from 'zustand';
import axios from "axios";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from './store';

interface CartItem {
  cartItemId: number;
  cartId: number;
  proId: number;
  proName: string;
  size: string;
  quantity: number;
  totalPrice: number;
  total: number;
  imageUrl?: string;
  selected: boolean;
}

interface CartResponse {
  listCartItemResponses: CartItem[] | undefined;
  cartId: number;
  total: number;
  cartItemList: CartItem[];
}

interface CartListResponse {
  userId: number;
  total: number;
  listCart: { cartId: number; totalProduct: number; statusCart: string; price: number }[];
}

interface Voucher {
  id: number;
  userId: number;
  voucherId: number;
  status: string;
  name: string;
  description: string;
  discountAmount: number;
  discountPercentage: number;
  minOrderValue: number;
  expiryDate: string;
}

interface SelectedVoucher {
  selectedVoucherId: number | null;
  selectedVoucherKey: string | null;
  selectedVoucherDiscountAmount: number;
}

interface CartStore {
  cart: CartItem[];
  cartTotal: number;
  currentCartId: number | null;
  vouchers: Voucher[];
  voucherTotal: number;
  selectedVoucher: SelectedVoucher;
  coin: number;  // New field for storing coins
  order: any | null; 
  ensureActiveCart: () => Promise<number>;
  fetchCartItem: () => Promise<void>;
  fetchVoucher: () => Promise<void>;
  setSelectedVoucher: (voucher: SelectedVoucher) => void;
  addToCart: (proId: number, size: string, quantity: number, language: string) => Promise<void>;
  increaseQuantity: (cartItemId: number) => Promise<void>;
  decreaseQuantity: (cartItemId: number) => Promise<void>;
  deleteCartItem: (cartItemId: number) => Promise<void>;
  deleteAllCartItems: () => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  changeSize: (cartItemId: number, size: string) => Promise<void>;
  setCoin: (coinAmount: number) => void;  // New function to update the coin state
  updateCartTotal: () => void;
  createOrder: (note: string) => void;  // New function to update the coin state
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      cartTotal: 0,
      currentCartId: null,
      vouchers: [],
      voucherTotal: 0,
      selectedVoucher: {
        selectedVoucherId: null,
        selectedVoucherKey: null,
        selectedVoucherDiscountAmount: 0,
      },
      order: null,

      coin: 0,  // Initialize the coin state to 0

      // Function to set the coin amount
      setCoin: (coinAmount: number) => {
        console.log("🔢 Setting coin amount to:", coinAmount);
        set({ coin: coinAmount });
      },

      updateCartTotal: () => {
        const cartItems = get().cart;
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        set({ cartTotal: totalQuantity });
      },
      

      ensureActiveCart: async () => {
        try {
          const { userId } = useCategoryStore.getState();
          if (!userId) throw new Error("User not logged in");

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          console.log(`🔍 Checking cart existence for user ${userId}`);

          const cartListResponse = await axiosInstance.get<CartListResponse>(
            `/cart/list-cart/${userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          const restoreCart = cartListResponse.data.listCart.find(cart => cart.statusCart === "RESTORE");
          const activeCart = restoreCart || cartListResponse.data.listCart.find(cart => ["NEW", "PAUSE"].includes(cart.statusCart));

          if (activeCart) {
            console.log("✅ Found active cart:", activeCart.cartId);
            set({ currentCartId: activeCart.cartId });
            return activeCart.cartId;
          }

          console.log("➕ Creating new cart...");
          const createCartResponse = await axiosInstance.post<{ cartId: number }>(
            '/cart/create',
            { userId },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("✅ New cart created:", createCartResponse.data.cartId);
          set({ currentCartId: createCartResponse.data.cartId });
          return createCartResponse.data.cartId;
        } catch (error) {
          console.error("❌ Error ensuring active cart:", error);
          throw error;
        }
      },

      fetchCartItem: async () => {
        try {
          let { currentCartId } = get();

          if (!currentCartId) {
            console.log("🔄 No active cart, ensuring...");
            currentCartId = await get().ensureActiveCart();
            set({ currentCartId });
          }

          const { language } = useCategoryStore.getState();
          if (!language) throw new Error("Language not set");

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          console.log(`📦 Fetching cart items for cart ${currentCartId} in ${language}...`);

          const response = await axiosInstance.get<CartResponse>(
            `/cart/list-cartItem/${currentCartId}?language=${language}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("✅ Cart items fetched:", response.data);

          const updatedCartItems = (response.data.listCartItemResponses ?? []).map(item => ({
            ...item,
            imageUrl: item.imageUrl || '',
          }));

          set({
            cart: updatedCartItems,
            cartTotal: response.data.total ?? 0,
          });
          get().updateCartTotal();

        } catch (error) {
          console.error("❌ Error fetching cart items:", error);
          set({ cart: [], cartTotal: 0 });
          throw error;
        }
      },

      changeSize: async (cartItemId: number, size: string) => {
        try {
          const accessToken = await AsyncStorage.getItem('access_token');
          const { userId } = useCategoryStore.getState();
          
          if (!accessToken) throw new Error("Access token missing");
          if (!userId) throw new Error("User ID missing");

          console.log(`🔄 Changing size for cart item ${cartItemId} to ${size}...`);

          const payload = {
            userId: Number(userId),
            cartItemId,
            size,
          };

          console.log("🛠 Payload to change size:", payload);

          // Send PUT request to the API to change the size of the cart item
          const response = await axiosInstance.put(
            '/cart-item/change-size',
            payload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("📩 Response from server:", response.data);

          // After successfully changing the size, fetch the updated cart items
          await get().fetchCartItem();
          console.log("✅ Size updated successfully!");
        } catch (error) {
          console.error("❌ Error changing size:", error);
        }
      },

      updateQuantity: async (cartItemId: number, quantity: number) => {
        try {
          const accessToken = await AsyncStorage.getItem('access_token');
          const { userId } = useCategoryStore.getState();
      
          if (!accessToken) throw new Error("Access token missing");
          if (!userId) throw new Error("User ID missing");
      
          console.log(`🔄 Updating quantity for cart item ${cartItemId} to ${quantity}...`);
      
          const payload = {
            userId: Number(userId),
            cartItemId,
            quantity,
          };
      
          console.log("🛠 Payload to update quantity:", payload);
      
          // Send PUT request to update the quantity of the cart item
          const response = await axiosInstance.put(
            `/cart-item/update`,
            payload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
      
          console.log("📩 Response from server:", response.data);
      
          // Update the cart after the quantity update
          await get().fetchCartItem();
          console.log("✅ Quantity updated successfully!");
          get().updateCartTotal();
        } catch (error) {
          console.error("❌ Error updating quantity:", error);
        }
      },
      
      

      increaseQuantity: async (cartItemId: number) => {
        try {
          const accessToken = await AsyncStorage.getItem('access_token');
          const { userId } = useCategoryStore.getState(); // 🔥 Lấy userId đúng cách

          if (!accessToken) throw new Error("Access token missing");
          if (!userId) throw new Error("User ID missing");

          console.log(`🔼 Increasing quantity for cart item ${cartItemId}...`);

          const payload = { userId: Number(userId), cartItemId, quantity: 1 };
          console.log("🛠 Payload gửi đi:", payload);

          const response = await axiosInstance.put(
            `/cart-item/increase`,
            payload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("📩 Response từ server:", response.data);
          console.log("✅ Quantity increased successfully!");

          await get().fetchCartItem();
          get().updateCartTotal();
          console.log("🔄 Cart updated successfully!");
        } catch (error) {
          console.error("❌ Error increasing quantity:", error);
        }
      },

     // Hàm xóa sản phẩm khỏi giỏ hàng
     deleteCartItem: async (cartItemId: number) => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const { userId } = useCategoryStore.getState();
    
        if (!accessToken) throw new Error("Access token missing");
        if (!userId) throw new Error("User ID missing");
    
        console.log("🔴 Deleting item with cartItemId:", cartItemId);
    
        const deletePayload = { userId: Number(userId), cartItemId };
    
        // Send DELETE request to the server
        const deleteResponse = await axiosInstance.delete(
          `/cart-item/delete/${cartItemId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: deletePayload,
          }
        );
    
        console.log("🗑 Item deleted successfully:", deleteResponse.data.message);
    
        // Update the cart in the store after deletion
        const updatedCart = useCartStore.getState().cart.filter(item => item.cartItemId !== cartItemId);
        set({ cart: updatedCart });
        get().updateCartTotal();
    
      } catch (error) {
        console.error("❌ Error deleting cart item:", error);
      }
    },

    deleteAllCartItems: async () => {
      try {
        const { currentCartId } = get();
        const { userId } = useCategoryStore.getState();  // Get userId from the store
    
        if (!userId) throw new Error("User not logged in");
        if (!currentCartId) throw new Error("No active cart found");
    
        const accessToken = await AsyncStorage.getItem('access_token');
        if (!accessToken) throw new Error("Access token missing");
    
        console.log(`🗑️ Deleting all items from cart ${currentCartId} for user ${userId}...`);
    
        const payload = {
          userId: Number(userId),
          cartId: currentCartId,
        };
    
        // Send DELETE request to the server
        const response = await axiosInstance.delete(
          `/cart/delete-allItem/${currentCartId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: payload,
          }
        );
    
        console.log("✅ All items deleted successfully:", response.data.message);
    
        // Update the cart in the store after deletion
        set({ cart: [], cartTotal: 0 });
    
      } catch (error) {
        console.error("❌ Error deleting all items from the cart:", error);
      }
    },
    
    

    // Hàm giảm số lượng sản phẩm trong giỏ hàng (decreaseQuantity)
    decreaseQuantity: async (cartItemId: number) => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const { userId } = useCategoryStore.getState(); // 🔥 Lấy userId đúng cách

        if (!accessToken) throw new Error("Access token missing");
        if (!userId) throw new Error("User ID missing");

        console.log(`🔽 Decreasing quantity for cart item ${cartItemId}...`);

        // Get the current cart state from the store
        const cart = useCartStore.getState().cart;
        const cartItem = cart.find(item => item.cartItemId === cartItemId);

        if (!cartItem) {
          throw new Error("Cart item not found");
        }

        const currentQuantity = cartItem.quantity;

        if (currentQuantity > 1) {
          // If quantity is greater than 1, decrease the quantity
          console.log("🔼 Quantity is greater than 1, decreasing...");

          const payload = { userId: Number(userId), cartItemId, quantity: 1 };
          console.log("🛠 Payload for decrease:", payload);

          const response = await axiosInstance.put(
            `/cart-item/decrease`,
            payload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("📩 Response from server:", response.data);

          console.log("✅ Quantity decreased successfully!");

          await get().fetchCartItem();
        } else if (currentQuantity === 1 || currentQuantity < 1) {
          // If quantity is 1 or less, delete the item
          await get().deleteCartItem(cartItemId);
          get().updateCartTotal();
        }
      } catch (error) {
        console.error("❌ Error decreasing quantity:", error);
      }
    },
      
      fetchVoucher: async () => {
        try {
          const { userId } = useCategoryStore.getState();
          if (!userId) throw new Error("User not logged in");

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          console.log(`🎟 Fetching vouchers for user ${userId}...`);

          const response = await axiosInstance.get<{ total: number; getVoucherResponseList: Voucher[] }>(
            `/user-voucher/view-all/${userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          let voucherList = response.data.getVoucherResponseList || [];
          console.log("✅ List of vouchers received:", voucherList);

          if (voucherList.length === 0) {
            set({ vouchers: [], voucherTotal: 0 });
            console.log("⚠️ No vouchers found.");
            return;
          }

          const detailedVouchers = await Promise.all(
            voucherList.map(async (voucher) => {
              try {
                console.log(`🔍 Fetching details for voucher ${voucher.voucherId}...`);

                const voucherDetailResponse = await axiosInstance.get<{ body: any }>(
                  `/voucher/view/${voucher.voucherId}`,
                  { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                const voucherDetails = voucherDetailResponse.data?.body;
                if (!voucherDetails) {
                  console.warn(`⚠️ No details found for voucher ${voucher.voucherId}`);
                  return null;
                }

                return {
                  ...voucher,
                  name: voucherDetails.key || voucher.name,
                  description: `Voucher giảm ${voucherDetails.discount} VND`,
                  discountAmount: voucherDetails.discount ?? 0,
                  discountPercentage: 0,
                  minOrderValue: voucherDetails.minOrderValue ?? 0,
                  expiryDate: voucherDetails.endDate || voucher.expiryDate,
                };
              } catch (error) {
                console.error(`❌ Error fetching voucher ${voucher.voucherId}:`, error);
                return null;
              }
            })
          );

          const validVouchers = detailedVouchers.filter((v) => v !== null);

          set({ vouchers: validVouchers, voucherTotal: response.data.total });

        } catch (error) {
          console.error("❌ Error fetching vouchers:", error);
          set({ vouchers: [], voucherTotal: 0 });
        }
      },

      createOrder: async (note: string) => {
        try {
          const { currentCartId, selectedVoucher, coin } = get();
          const { userId, language } = useCategoryStore.getState();
      
          if (!userId) throw new Error("User not logged in");
          if (!currentCartId) throw new Error("No active cart found");
      
          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");
      
          const voucherId = selectedVoucher.selectedVoucherId || "string";  
          const pointCoinUse = coin || 0;  
      
          console.log(`🛒 Creating order...`);
      
          const response = await axiosInstance.post(
            '/orders/create',
            { userId, cartId: currentCartId, voucherId, pointCoinUse, note, language },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
      
          console.log("✅ Order created successfully:", response.data);
      
          const order = response.data.body;  // Store order details
          set({ 
            order,  // ✅ Save the order in Zustand store
            cart: [], 
            cartTotal: 0, 
            selectedVoucher: {
              selectedVoucherId: null,
              selectedVoucherKey: null,
              selectedVoucherDiscountAmount: 0
            }, 
            coin: 0, 
            currentCartId: null
          });
      
          console.log("🛍 Order stored in state:", order);
      
          return order;  // Return order details
        } catch (error) {
          console.error("❌ Error creating order:", error);
          throw error;
        }
      },
      
      

      addToCart: async (proId: number, size: string, quantity: number, language: string) => {
        try {
            let { currentCartId } = get();
            if (!currentCartId) {
                console.log("🔄 No active cart, ensuring...");
                currentCartId = await get().ensureActiveCart();
                set({ currentCartId });
            }
    
            const { userId } = useCategoryStore.getState();
            if (!userId) throw new Error("User not logged in");
    
            const accessToken = await AsyncStorage.getItem('access_token');
            if (!accessToken) throw new Error("Access token missing");
    
            console.log(`➕ Adding product ${proId} (Size: ${size}, Qty: ${quantity}) to cart ${currentCartId}`);
    
            const response = await axiosInstance.post<CartItem>(
                `/cart-item/insert`,
                { userId, cartId: currentCartId, proId, size, quantity, language },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
    
            console.log("✅ Added to cart:", response.data);
    
            await get().fetchCartItem(); // Cập nhật lại giỏ hàng sau khi thêm
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400) {
                    throw new Error("❌ Vượt quá số lượng tồn kho");
                }
            }
            throw new Error("❌ Lỗi thêm vào giỏ hàng");
        }
    },    

      setSelectedVoucher: ({ selectedVoucherId, selectedVoucherKey, selectedVoucherDiscountAmount }) => {
        console.log("🛒 Setting selected voucher:", { selectedVoucherId, selectedVoucherKey, selectedVoucherDiscountAmount });
        set({ selectedVoucher: { selectedVoucherId, selectedVoucherKey, selectedVoucherDiscountAmount } });
      },

    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
