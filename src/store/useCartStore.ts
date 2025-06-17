import { create } from 'zustand';
import axios from "axios";
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from './store';
import { Alert } from 'react-native';
import { useAlertStore } from './alertStore';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';

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

interface GroupCartData {
  total: number;
  crudGroupOrderResponse: CrudGroupOrderResponse;
  crudGroupOrderResponseList: CrudGroupOrderResponseListItem[];
}

interface CrudGroupOrderResponse {
  groupOrderId: number;
  nameLeader: string;
  address: string;
  note: string;
  link: string;
  code: string;
  nameGroup: string;
  totalPrice: number;
  typeGroupOrder: 'PAY_FOR_ALL' | 'SPLIT_EACH'; // giả sử chỉ có 2 loại
  status: 'SHOPPING' | 'PAID' | 'CANCELLED'; // thêm nếu có
  isDeleted: boolean;
  orderDate: string; // ISO datetime string
  deadlinePayment: string;
  dateCreated: string;
  dateUpdated: string;
  dateDeleted: string | null;
}
type CreateOrderResult =
  | { orderId: string; errorCode: null; errorData: null }
  | { orderId: null; errorCode: string; errorData: any };



interface CrudGroupOrderResponseListItem {
  memberId: number;
  name: string;
  groupOrderId: number;
  userId: number;
  amount: number;
  isPaid: boolean;
  isLeader: boolean;
  note: string;
  status: 'SHOPPING' | 'PAID' | 'CANCELLED'; // giả định thêm
  typePayment: 'NONE' | 'CASH' | 'BANK_TRANSFER'; // giả định thêm
  dateCreated: string;
  dateUpdated: string | null;
  dateDeleted: string | null;
  isDeleted: boolean;
  crudCartGroupResponse: CrudCartGroupResponse;
}

interface CrudCartGroupResponse {
  cartGroupId: number;
  groupId: number;
  userId: number;
  memberId: number;
  listCartItemGroup: CartItemGroup[];
  totalPrice: number;
  totalQuantity: number;
}

interface CartItemGroup {
  cartItemGroupId: number;
  proId: number;
  proName: string;
  cartGroupId: number;
  size: string;
  itemPrice: number;
  totalPrice: number;
  quantity: number;
  imageUrl: string;
}

interface GroupCartData {
  total: number;
  crudGroupOrderResponse: CrudGroupOrderResponse;
  crudGroupOrderResponseList: CrudGroupOrderResponseListItem[];
}

interface CrudGroupOrderResponse {
  groupOrderId: number;
  nameLeader: string;
  address: string;
  note: string;
  link: string;
  code: string;
  nameGroup: string;
  totalPrice: number;
  typeGroupOrder: 'PAY_FOR_ALL' | 'SPLIT_EACH';
  status: 'SHOPPING' | 'PAID' | 'CANCELLED';
  isDeleted: boolean;
  orderDate: string; // ISO datetime string
  deadlinePayment: string;
  dateCreated: string;
  dateUpdated: string;
  dateDeleted: string | null;
}

interface CrudGroupOrderResponseListItem {
  memberId: number;
  name: string;
  groupOrderId: number;
  userId: number;
  amount: number;
  isPaid: boolean;
  isLeader: boolean;
  note: string;
  status: 'SHOPPING' | 'PAID' | 'CANCELLED';
  typePayment: 'NONE' | 'CASH' | 'BANK_TRANSFER';
  dateCreated: string;
  dateUpdated: string | null;
  dateDeleted: string | null;
  isDeleted: boolean;
  crudCartGroupResponse: CrudCartGroupResponse;
}

interface CrudCartGroupResponse {
  cartGroupId: number;
  groupId: number;
  userId: number;
  memberId: number;
  listCartItemGroup: CartItemGroup[];
  totalPrice: number;
  totalQuantity: number;
}

interface CartItemGroup {
  cartItemGroupId: number;
  proId: number;
  proName: string;
  cartGroupId: number;
  size: string;
  itemPrice: number;
  totalPrice: number;
  quantity: number;
  imageUrl: string;
}

// CartStore interface
interface CartStore {
  cart: CartItem[];
  cartTotal: number;
  currentCartId: number | null;
  vouchers: Voucher[];
  voucherTotal: number;
  selectedVoucher: SelectedVoucher;
  coin: number;  // New field for storing coins
  order: any | null;
  orderId: number;
  ensureActiveCart: () => Promise<number>;
  fetchCartItem: () => Promise<void>;
  fetchVoucher: () => Promise<void>;
  setSelectedVoucher: (voucher: CartStore['selectedVoucher']) => void;
  addToCart: (proId: number, size: string, quantity: number, language: string) => Promise<void>;
  increaseQuantity: (cartItemId: number) => Promise<void>;
  decreaseQuantity: (cartItemId: number) => Promise<void>;
  deleteCartItem: (cartItemId: number) => Promise<void>;
  deleteAllCartItems: () => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  changeSize: (cartItemId: number, size: string) => Promise<void>;
  setCoin: (coinAmount: number) => void;  // New function to update the coin state
  updateCartTotal: () => void;
  createOrder: (note: string) => Promise<CreateOrderResult>;  // New function to update the coin state
  setOrderId: (orderId: number) => void;
  idCartPause: number | null; // 🆕 thêm
  setIdCartPause: (id: number | null) => void; // 🆕 thêm
  idOrderPause: number | null; // 🆕 thêm
  setIdOrderPause: (id: number | null) => void; // 🆕 thêm
  handleRestoreOrder: (orderId: number, userId: number) => void;
  groupCartId: number | null;
  setGroupCartId: (id: number | null) => void;
  checkGroupCart: () => Promise<number | null>;
  hasRejectedGroupCart: boolean,
  setHasRejectedGroupCart: (value: boolean) => void;

  // Group Cart Data sẽ được sử dụng trực tiếp từ CartStore
  groupCartData: GroupCartData | null;
  hasGroupCart: boolean;
  setHasGroupCart: (value: boolean) => void;
  createGroupOrder: (userId: number, name: string, flexiblePayment: boolean, datePayment: { hour: number; minute: number; second: number; nano: number } | null, type: "PAY_FOR_ALL" | "PAY_INDIVIDUAL", typeTime: "NO_TIME" | "TIME") => Promise<boolean>;
  groupOrderCount: number;
  setGroupOrderCount: (count: number) => void;

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
      groupCartData: null,
      order: null,
      orderId: 0,
      coin: 0,  // Initialize the coin state to 0
      idCartPause: null,
      idOrderPause: null,
      hasRejectedGroupCart: false,
      setHasRejectedGroupCart: (value: boolean) => set({ hasRejectedGroupCart: value }),
      hasGroupCart: false,
      setHasGroupCart: (value: boolean) => set({ hasGroupCart: value }),
      groupOrderCount: 0,
      setGroupOrderCount: (count) => set({ groupOrderCount: count }),

      groupCartId: null,
      setGroupCartId: (id: number | null) => {
        console.log("👥 Đặt groupCartId:", id);
        set({ groupCartId: id });
      },


      setIdCartPause: (id: number | null) => {
        console.log("⏸️ Đặt idCartPause:", id);
        set({ idCartPause: id });
      },

      setIdOrderPause: (id: number | null) => {
        console.log("⏸️ Đặt idOrderPause:", id);
        set({ idOrderPause: id });
      },



      // Function to set the coin amount
      setCoin: (coinAmount: number) => {
        console.log("🔢 Setting coin amount to:", coinAmount);
        set({ coin: coinAmount });
      },

      setOrderId: (orderId: number) => {
        console.log("🔢 Đặt orderId:", orderId);
        set({ orderId });
      },


      updateCartTotal: () => {
        const cartItems = get().cart;
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        set({ cartTotal: totalQuantity });
      },

      checkGroupCart: async () => {

        try {
          const { userId } = useCategoryStore.getState();
          if (!userId) throw new Error("User not logged in");

          const { hasRejectedGroupCart } = get();
          if (hasRejectedGroupCart) {
            console.log("🚫 Người dùng đã từ chối group cart trước đó.");
            return null;
          }

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          const parsedUserId = typeof userId === "string" ? parseInt(userId, 10) : Number(userId);
          if (isNaN(parsedUserId)) throw new Error("Invalid userId");

          // 1. Gọi API lấy danh sách group order đang tham gia
          const listResponse = await axiosInstance.get(
            `/group-order/get-group-activate/${parsedUserId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const groupOrderList = listResponse.data?.list || [];
          const groupOrderCount = listResponse.data?.total || 0;

          // ⚠️ Cập nhật số lượng nhóm tham gia vào store
          get().setGroupOrderCount(groupOrderCount);
          if (groupOrderList.length === 0) {
            console.log("❌ Không có đơn hàng nhóm nào đang hoạt động.");
            get().setGroupCartId(null);
            get().setHasGroupCart(false);
            return null;
          }

          console.log("📦 Danh sách đơn nhóm:", groupOrderList);

          // 2. Gọi API kiểm tra xem user có phải trưởng nhóm không
          const response = await axiosInstance.get<number>(
            `/group-order/get-id-group/${parsedUserId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const groupCartId = response.data;
          console.log("👑 Group Cart ID (trưởng nhóm):", groupCartId);

          set({
            groupCartId: groupCartId !== 0 ? groupCartId : null,
            hasGroupCart: true,
          });
          const message = i18n.t('android.mess.check2');
          const title = i18n.t('common.noti');

          // 3. Nếu là trưởng nhóm, hỏi người dùng có muốn tiếp tục không
          if (groupCartId !== 0) {
            return await new Promise<number | null>((resolve) => {
              useAlertStore.getState().showAlert(
                title,
                message,
                () => { // onConfirm
                  console.log("✅ Sử dụng group cart ID:", groupCartId);
                  set({ currentCartId: groupCartId });
                  resolve(groupCartId);
                },
                () => { // onCancel
                  console.log("❌ Người dùng từ chối sử dụng đơn nhóm.");
                  get().setHasRejectedGroupCart(true);
                  get().ensureActiveCart();
                  resolve(null);
                }
              );
            });
          }


          // 4. Nếu chỉ là thành viên, không hỏi, trả về null (không tiếp tục group cart)
          console.log("ℹ️ Người dùng chỉ là thành viên, không tiếp tục group cart.");
          set({
            hasRejectedGroupCart: true,
          });
          return null;
        } catch (error) {
          console.error("❌ Error checking group cart:", error);
          return null;
        }
      },

      createGroupOrder: async (
        userId: number,
        name: string,
        flexiblePayment: boolean,
        datePayment: { hour: number; minute: number; second: number; nano: number } | null,
        type: "PAY_FOR_ALL" | "PAY_INDIVIDUAL",
        typeTime: "NO_TIME" | "TIME"
      ): Promise<boolean> => {
        try {
          // const existingGroupCartId = await get().checkGroupCart();
          // if (existingGroupCartId) {
          //   console.log("⚠️ Đã có group cart. Không tạo mới.");
          //   return false;
          // }

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error('Access token not found');

          const payload: any = {
            userId,
            name,
            flexiblePayment,
            type,
            typeTime,
          };

          if (datePayment) {
            payload.datePayment = datePayment;
          }

          // ⚠️ Thêm log tại đây
          console.log("📦 Payload gửi đi:", payload);


          const response = await axiosInstance.post('/group-order/create', payload, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          const data = response.data;
          if (!data?.groupOrderId) throw new Error("Không nhận được groupOrderId");

          const groupCartData: GroupCartData = {
            total: data.totalPrice,
            crudGroupOrderResponse: {
              groupOrderId: data.groupOrderId,
              nameLeader: data.nameLeader,
              address: data.address || "",
              note: data.note || "",
              link: data.link || "",
              code: data.code || "",
              nameGroup: data.nameGroup || "",
              totalPrice: data.totalPrice,
              typeGroupOrder: data.typeGroupOrder,
              status: 'SHOPPING',
              isDeleted: data.isDeleted,
              orderDate: data.orderDate,
              deadlinePayment: data.deadlinePayment,
              dateCreated: data.dateCreated,
              dateUpdated: data.dateUpdated || null,
              dateDeleted: data.dateDeleted || null,
            },
            crudGroupOrderResponseList: [],
          };

          set({
            groupCartId: data.groupOrderId,
            currentCartId: data.groupOrderId,
            groupCartData,
            hasGroupCart: true,
            groupOrderCount: 1,
          });

          return true;

        } catch (error) {
          console.error("❌ Lỗi khi tạo group order:", error);
          return false;
        }
      },


      ensureActiveCart: async () => {
        try {
          const { userId } = useCategoryStore.getState();
          if (!userId) throw new Error("User not logged in");

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          const { data: { listCart } } = await axiosInstance.get<CartListResponse>(
            `/cart/list-cart/${userId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          // Ưu tiên cart COMPLETED_PAUSE
          const completedPauseCart = listCart.find(cart => cart.statusCart === "COMPLETED_PAUSE");
          if (completedPauseCart) {
            const pausedCartId = completedPauseCart.cartId;
            get().setIdCartPause(pausedCartId);

            // 🔁 Gọi API để lấy thông tin order tương ứng với cart bị pause
            try {
              const { data: orderPauseData } = await axiosInstance.get<{ orderId: number }>(
                `/orders/detail_order_pause`,
                {
                  params: {
                    cartId: pausedCartId,
                    language: "EN"
                  },
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              );

              const idOrderPause = orderPauseData.orderId;
              console.log("📦 Found paused order, setting idOrderPause:", idOrderPause);
              get().setIdOrderPause(idOrderPause);
            } catch (orderErr) {
              console.warn("⚠️ Could not fetch paused order:", orderErr);
            }
          }

          // Kiểm tra idCartPause và gán currentCartId nếu có idCartPause
          const idCartPause = get().idCartPause;
          if (idCartPause !== null) {
            console.log("🔄 Using paused cart ID:", idCartPause);
            set({ currentCartId: idCartPause });
            return idCartPause;
          }

          // Tìm cart RESTORE hoặc NEW
          const restoreCart = listCart.find(cart => cart.statusCart === "RESTORE");
          const newCart = listCart.find(cart => cart.statusCart === "NEW");
          const activeCart = restoreCart || newCart;

          if (activeCart) {
            console.log("✅ Found active cart:", activeCart.cartId);
            set({ currentCartId: activeCart.cartId });
            return activeCart.cartId;
          }

          // Không có cart hợp lệ, tạo mới
          console.log("➕ Creating new cart...");
          const { data: { cartId } } = await axiosInstance.post<{ cartId: number }>(
            '/cart/create',
            { userId },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("✅ New cart created:", cartId);
          set({ currentCartId: cartId });
          return cartId;
        } catch (error) {
          console.error("❌ Error ensuring active cart:", error);
          throw error;
        }
      },

      fetchCartItem: async () => {
        try {
          let { currentCartId, groupCartId, hasRejectedGroupCart } = get();

          if (!currentCartId) {
            console.log("🔄 No active cart, ensuring...");
            currentCartId = await get().ensureActiveCart();
            set({ currentCartId });
          }

          const { language } = useCategoryStore.getState();
          if (!language) throw new Error("Language not set");

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          const isGroupCart = groupCartId && !hasRejectedGroupCart;

          if (isGroupCart) {
            // 👉 Gọi API lấy chi tiết group cart
            console.log(`👥 Fetching group cart detail for cart ${groupCartId} in ${language}...`);
            const response = await axiosInstance.get(`/group-order/detail-group/${groupCartId}?language=${language}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            const groupData = response.data;
            const listCartItemGroup = groupData.crudGroupOrderResponse?.crudCartGroupResponse?.listCartItemGroup ?? [];

            const updatedCartItems = listCartItemGroup.map((item: { imageUrl: any; proName: any; quantity: any; itemPrice: any; totalPrice: any; size: any; }) => ({
              ...item,
              imageUrl: item.imageUrl?.replace(/^.*?:\s*/, '') || '',
              proName: item.proName,
              quantity: item.quantity,
              itemPrice: item.itemPrice,
              totalPrice: item.totalPrice,
              size: item.size
            }));

            // Sử dụng totalQuantity từ response thay vì total
            const cartTotal = Number(response.data.total);

            // Debugging: Log cartTotal to verify its value
            console.log("Calculated cartTotal:", cartTotal);

            // Set groupCartData to store
            set({
              groupCartData: {
                total: cartTotal,
                crudGroupOrderResponse: groupData.crudGroupOrderResponse, // Assign group order response
                crudGroupOrderResponseList: groupData.crudGroupOrderResponseList || [], // Assign members' data
              },
              cart: updatedCartItems,
              cartTotal: cartTotal,
            });
            console.log("✅ Group cart data set:", get().groupCartData);

            return;
          }

          // 🛒 Xử lý cart bình thường
          console.log(`📦 Fetching cart items for cart ${currentCartId} in ${language}...`);

          const response = await axiosInstance.get<CartResponse>(
            `/cart/list-cartItem/${currentCartId}?language=${language}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          const updatedCartItems = (response.data.listCartItemResponses ?? []).map(item => ({
            ...item,
             imageUrl: item.imageUrl?.replace(/^.*?:\s*/, '') || '',
          }));

          set({
            cart: updatedCartItems,
            cartTotal: response.data.total ?? 0,
          });
          get().updateCartTotal();

          console.log("✅ Normal cart items fetched:", updatedCartItems);
        } catch (error) {
          console.error("❌ Error fetching cart items:", error);
          set({ cart: [], cartTotal: 0 });
          throw error;
        }
      },


      handleRestoreOrder: (orderId: number, userId: number): void => {
        Alert.alert(
          'Mua lại',
          `Bạn có chắc chắn muốn mua lại đơn hàng ${orderId} không?`,
          [
            {
              text: 'Huỷ',
              style: 'cancel',
            },
            {
              text: 'Đồng ý',
              onPress: async () => {
                try {
                  const token = await AsyncStorage.getItem('access_token');
                  if (!token) {
                    console.error('Không tìm thấy token');
                    return;
                  }

                  const response = await axiosInstance.post(
                    '/orders/restore',
                    {
                      orderId: orderId,
                      userId: userId,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );

                  set({ currentCartId: response.data.cartId });
                  get().fetchCartItem();
                  console.log('✅ Mua lại thành công:', response.data);
                  Alert.alert('Thành công', 'Đơn hàng đã được mua lại!');
                } catch (error) {
                  console.error('❌ Lỗi khi mua lại đơn hàng:', error);
                  Alert.alert('Lỗi', 'Không thể mua lại đơn hàng. Vui lòng thử lại sau.');
                }
              },
            },
          ]
        );
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

          const payload = { userId: Number(userId), cartItemId, quantity };

          const response = await axiosInstance.put(
            `/cart-item/update`,
            payload,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          await get().fetchCartItem();
          get().updateCartTotal();
        } catch (error) {
          await get().fetchCartItem();
          throw new Error("Vượt quá số lượng cho phép!");
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
          const { cart, updateCartTotal, ensureActiveCart, fetchCartItem } = get();

          if (!accessToken) throw new Error("Access token missing");
          if (!userId) throw new Error("User ID missing");

          console.log("🔴 Deleting item with cartItemId:", cartItemId);

          const deletePayload = { userId: Number(userId), cartItemId };

          await axiosInstance.delete(`/cart-item/delete/${cartItemId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: deletePayload,
          });

          console.log("🗑 Item deleted successfully");

          const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
          set({ cart: updatedCart });

          updateCartTotal();

          // Nếu giỏ hàng trống, gọi đồng thời ensureActiveCart và fetchCartItem
          if (updatedCart.length === 0) {
            await get().ensureActiveCart();
            await get().fetchCartItem();
          }

        } catch (error) {
          console.error("❌ Error deleting cart item:", error);
        }
      },


      deleteAllCartItems: async () => {
        try {
          const { currentCartId } = get();
          const { userId } = useCategoryStore.getState();

          if (!userId) throw new Error("User not logged in");
          if (!currentCartId) throw new Error("No active cart found");

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          console.log(`🗑️ Deleting all items from cart ${currentCartId} for user ${userId}...`);

          const payload = {
            userId: Number(userId),
            cartId: currentCartId,
          };

          const response = await axiosInstance.delete(
            `/cart/delete-allItem/${currentCartId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              data: payload,
            }
          );

          console.log("✅ All items deleted successfully:", response.data.message);

          set({ cart: [], cartTotal: 0 });

          // 🔄 Tạo lại giỏ nếu đã xóa hết
          await get().ensureActiveCart();

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


      createOrder: async (note: string): Promise<CreateOrderResult> => {
        try {
          const { currentCartId, selectedVoucher, coin } = get();
          const { userId, language } = useCategoryStore.getState();

          if (!userId || !currentCartId) {
            return { orderId: null, errorCode: 'MISSING_USER_OR_CART', errorData: null };
          }

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) {
            return { orderId: null, errorCode: 'MISSING_TOKEN', errorData: null };
          }

          const voucherId = selectedVoucher.selectedVoucherId || "string";
          const pointCoinUse = coin || 0;

          console.log("🧾 userId:", userId);
          console.log("🛒 currentCartId:", currentCartId);

          const response = await axiosInstance.post(
            '/orders/create',
            { userId, cartId: currentCartId, voucherId, pointCoinUse, note, language },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          console.log("📦 API response data:", response.data);
          console.log("📦 API response body type:", typeof response.data.body);


          const body = response.data.body;

          // ❗ Nếu body là string (lỗi), thì ném về catch
          if (typeof body === 'string') {
            throw { response: { status: 400, data: body } };
          }

          const order = body;
          const orderId = order?.orderId;
          if (!orderId) {
            return { orderId: null, errorCode: 'INVALID_ORDER_ID', errorData: null };
          }


          set({
            order,
            orderId,
            cart: [],
            cartTotal: 0,
            selectedVoucher: {
              selectedVoucherId: null,
              selectedVoucherKey: null,
              selectedVoucherDiscountAmount: 0,
            },
            coin: 0,
            currentCartId: null
          });

          return { orderId: String(orderId), errorCode: null, errorData: null };

        } catch (error: any) {
          console.error("❌ createOrder error:", error);

          if (error?.response?.status === 400) {
            const message = error.response.data;

            // 📌 Lỗi hết hàng
            const stockRegex = /Not enough product for (.+), size (.+)\. Requested quantity: (\d+), Available: (\d+)/;
            if (typeof message === 'string' && stockRegex.test(message)) {
              const matches = message.match(stockRegex);
              return {
                orderId: null,
                errorCode: 'STOCK_ERROR',
                errorData: {
                  product: matches?.[1],
                  size: matches?.[2],
                  requested: matches?.[3],
                  available: matches?.[4],
                }
              };
            }

            // 📌 Các lỗi khác
            return { orderId: null, errorCode: message, errorData: null };
          }

          if (error?.response?.status === 404 && error.response.data === "Outside of working hours.") {
            return { orderId: null, errorCode: 'OUTSIDE_WORKING_HOURS', errorData: null };
          }

          return { orderId: null, errorCode: 'UNKNOWN', errorData: null };
        }
      },


      addToCart: async (proId: number, size: string, quantity: number, language: string) => {
        try {
          const { userId } = useCategoryStore.getState();
          if (!userId) throw new Error("User not logged in");
          console.log("👤 userId:", userId);

          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) throw new Error("Access token missing");

          const { hasRejectedGroupCart, groupCartId, ensureActiveCart, fetchCartItem } = get();
          console.log("🔍 hasRejectedGroupCart:", hasRejectedGroupCart);
          console.log("🔍 groupCartId:", groupCartId);

          let targetCartId: number;
          let isGroupCart = false;

          if (!hasRejectedGroupCart && groupCartId) {
            // ✅ Đang sử dụng group cart → gọi API lấy cart phụ
            console.log("📦 Đang kiểm tra cart phụ với groupCartId:", groupCartId);
            const subCartRes = await axiosInstance.get<number>(
              `/group-order/get-id-cart-group/${userId}?groupOrderId=${groupCartId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` }
              }
            );

            console.log("📬 Kết quả lấy cart phụ:", subCartRes.data);

            if (typeof subCartRes.data === 'number' && subCartRes.data > 0) {
              targetCartId = subCartRes.data;
              isGroupCart = true;
              console.log("✅ Sử dụng cart phụ:", targetCartId);
            } else {
              console.warn("⚠️ Không tìm thấy cart phụ hợp lệ. Chuyển sang giỏ cá nhân.");
              targetCartId = await ensureActiveCart();
            }
          } else {
            // ✅ Nếu đã từ chối → dùng giỏ cá nhân
            console.log("🛒 Người dùng đã từ chối giỏ nhóm. Sử dụng cart cá nhân.");
            targetCartId = await ensureActiveCart();
          }

          console.log(`🧾 Chuẩn bị thêm sản phẩm vào ${isGroupCart ? 'group' : 'personal'} cart. CartID: ${targetCartId}`);
          console.log("🧱 Product Info:", { proId, size, quantity, language });

          const payload = {
            userId,
            cartId: targetCartId,
            proId,
            size,
            quantity,
            language
          };
          console.log("📤 Payload gửi đi:", payload);

          if (isGroupCart) {
            const response = await axiosInstance.post(
              `/cart-item/group-order/insert`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log("✅ Phản hồi từ API nhóm:", response.data);
          } else {
            const response = await axiosInstance.post(
              `/cart-item/insert`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log("✅ Phản hồi từ API cá nhân:", response.data);
          }

          await fetchCartItem();
          console.log("🔄 Cập nhật giỏ hàng thành công.");
        } catch (error: any) {
          if (axios.isAxiosError(error) && error.response) {
            console.error("❌ Axios error:", error.response.data);
            if (error.response.status === 400) {
              throw new Error("❌ Vượt quá số lượng tồn kho");
            }
          }
          console.error("❌ Lỗi khi thêm vào giỏ:", error);
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
