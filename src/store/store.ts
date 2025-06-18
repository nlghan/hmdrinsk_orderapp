import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/i18n';
import { useCartStore } from './useCartStore';

interface UserInfo {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  birth_date: string;
  address: string;
  email: string;
  phone: string;
  sex: string;
  role: string;
}

interface Post {
  postId: number;
  title: string;
  description: string;
  shortDescription: string;
  url: string;
}

export interface Category {
  cateId: number;
  cateName: string;
  cateImg: string;
}

interface ProductImage {
  id: number;
  linkImage: string;
}

interface ProductVariant {
  varId: number;
  proId: number;
  size: string;
  price: number;
  stock: number;
  deleted: boolean;
}

interface ProductReview {
  reviewId: number;
  userId: number;
  proId: number;
  fullName: string;
  content: string;
  ratingStart: number;
  isDelete: boolean;
  dateDeleted: string | null;
  dateUpdated: string | null;
  dateCreated: string;
}


interface Product {
  proId: number;
  cateId: number;
  proName: string;
  description: string;
  productImageResponseList: ProductImage[];
  listProductVariants: ProductVariant[];
  deleted: boolean;
  reviews?: ProductReview[];
  avgRating?: number;
  totalReviews?: number;
  isFavourited?: boolean; // ✅ Thêm trường này
}


interface DataStore {
  categories?: Category[];
  products?: Product[];
  posts?: Post[];
  userInfo?: UserInfo;
  userCoin?: number;
  favoriteItems?: FavoriteItem[];
}

interface FavoriteItem {
  favItemId: number;
  favId: number;
  proId: number;
  size: string;
}

interface FavoriteResponse {
  favId: number;
  total: number;
  favouriteItemResponseList: FavoriteItem[];
}

interface CategoryStore {
  data: DataStore;
  userId: number | null;
  language: string;
  setUserId: (id: number | null) => void;
  setLanguage: (lang: string) => void;
  fetchProductReviews: (proId: number, page?: number, limit?: number) => Promise<void>;
  addReviewToProduct: (proId: number, review: Omit<ProductReview, 'reviewId' | 'isDelete' | 'dateDeleted' | 'dateUpdated' | 'dateCreated'>) => Promise<void>;
  insertFavoriteItem: (favId: number, proId: number, size: string) => Promise<void>; // ✅ Thêm hàm insertFavoriteItem
  deleteAllFavItem: (favId: number) => Promise<void>; // ✅ Thêm hàm insertFavoriteItem
  deleteFavItem: (favItemId: number) => Promise<void>; 
  fetchProducts: () => Promise<void>;
  fetchFavoriteItems:() => Promise<void>;
  logout: () => void;
  checkShipment: () => Promise<any | null>;
  editReview: (review: Omit<ProductReview, 'isDelete' | 'dateDeleted' | 'dateUpdated' | 'dateCreated'>) => Promise<void>;
  deleteReview: (reviewId: number) => Promise<void>; 
  checkTimeOrder: () => Promise<void>;
  checkVoucher: () => Promise<any | null>;
  fetchUserCoin: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => {

      const fetchCategories = async () => {
        try {
          const lang = get().language;
          console.log(`🌍 [fetchCategories] Fetching with language: ${lang}`);
          const response = await axiosInstance.get(`/cate/list-category?page=1&limit=100&language=${lang}`);
          set((state) => ({
            data: { ...state.data, categories: response.data.categoryResponseList || [] },
          }));
        } catch (error) {
          console.error("❌ [fetchCategories] Error fetching categories:", error);
        }
      };

      const checkShipment = async () => {
        try {
          console.log("🚚 [checkShipment] Checking shipment time...");
      
          const token = await AsyncStorage.getItem('access_token'); // ✅ Đảm bảo lấy đúng access_token
          if (!token) {
            console.error("❌ [checkShipment] Không tìm thấy access_token!");
            return null;
          }
      
          const response = await axiosInstance.get('/shipment/check-time', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
      
          if (response.status === 200) {
            console.log("✅ [checkShipment] API trả về thành công nhưng không có dữ liệu.");
            return { message: "API trả về 200 nhưng không có nội dung cụ thể." }; // ✅ Tránh return undefined
          } else {
            console.error("⚠️ [checkShipment] API trả về mã khác 200:", response.status);
            return null;
          }
        } catch (error) {
          console.error("❌ [checkShipment] Lỗi khi kiểm tra shipment:", error);
          return null;
        }
      };

      const checkVoucher = async () => {
        try {
          console.log("🎟️ [checkVoucher] Đang kiểm tra trạng thái voucher...");
      
          const token = await AsyncStorage.getItem('access_token'); // ✅ Lấy access_token từ AsyncStorage
          if (!token) {
            console.error("❌ [checkVoucher] Không tìm thấy access_token!");
            return null;
          }
      
          const response = await axiosInstance.put('/voucher/check_status', null, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: '*/*'
            }
          });
      
          if (response.status === 200) {
            console.log("✅ [checkVoucher] API trả về thành công:", response.data);
            return response.data || { message: "API trả về 200 nhưng không có nội dung cụ thể." }; // ✅ Tránh undefined
          } else {
            console.error("⚠️ [checkVoucher] API trả về mã khác 200:", response.status);
            return null;
          }
        } catch (error) {
          console.error("❌ [checkVoucher] Lỗi khi kiểm tra voucher:", error);
          return null;
        }
      };
      
      
      

      const fetchPosts = async () => {
        try {
          const lang = get().language;
          console.log(`🌍 [fetchPosts] Fetching with language: ${lang}`);
          const response = await axiosInstance.get(`/post/view/all/desc?page=1&limit=4&language=${lang}`);
          set((state) => ({
            data: { ...state.data, posts: response.data.body.listPosts || [] },
          }));          
        } catch (error) {
          console.error("❌ [fetchPosts] Error fetching posts:", error);
        }
      };

      const fetchProducts = async () => {
        try {
          const lang = get().language;
          const response = await axiosInstance.get(`/product/list-product-android?language=${lang}`);

          const favoriteItems = get().data.favoriteItems || [];
          const newProducts = (response.data.productResponses || []).map((product: {
            proId: number;
            avgRating: number; // ✅ Lấy trực tiếp từ API
            cateId: number;
            proName: string;
            description: string;
            deleted: boolean;
            productImageResponseList: { id: number; linkImage: string }[];
            listProductVariants: { varId: number; size: string; price: number; stock: number; deleted: boolean }[];
          }) => ({
            proId: product.proId,
            cateId: product.cateId,
            proName: product.proName,
            description: product.description,
            deleted: product.deleted,
            avgRating: product.avgRating ?? 0, // ✅ Luôn có giá trị `number`
            productImageResponseList: product.productImageResponseList?.map(({ id, linkImage }) => ({ id, linkImage })) || [],
            listProductVariants: product.listProductVariants?.map(({ varId, size, price, stock, deleted }) => ({
              varId, proId: product.proId, size, price, stock, deleted,
            })) || [],
            isFavourited: favoriteItems.some((fav) => fav.proId === product.proId),
          }));

          set((state) => ({
            data: { ...state.data, products: newProducts },
          }));

          console.log("✅ [fetchProducts] Successfully updated store.");

          // ❌ Không cần fetchProductRating nữa

        } catch (error) {
          console.error("❌ [fetchProducts] Error:", error);
        }
      };

      const fetchProductReviews = async (proId: number, page: number = 1, limit: number = 5) => {
        try {
          const response = await axiosInstance.get(`/product/list-review?proId=${proId}&page=${page}&limit=${limit}`);
          const { listReviews, total } = response.data;

          set((state) => {
            const product = state.data.products?.find((p) => p.proId === proId);
            if (!product) return state;

            const existingReviews = product.reviews || [];
            const reviewMap = new Map(existingReviews.map((r) => [r.reviewId, r]));
            listReviews.forEach((review: ProductReview) => reviewMap.set(review.reviewId, review));

            return {
              data: {
                ...state.data,
                products: state.data.products?.map((p) =>
                  p.proId === proId
                    ? { ...p, reviews: Array.from(reviewMap.values()), totalReviews: total }
                    : p
                ),
              },
            };
          });

          console.log(`✅ [fetchProductReviews] Loaded page ${page} for product ${proId}. Total reviews: ${total}`);
        } catch (error) {
          console.error(`❌ [fetchProductReviews] Error for product ${proId}:`, error);
        }
      };

      const deleteReview = async (reviewId: number) => {
        try {
          const userId = get().userId;
          if (!userId) {
            console.error("❌ [deleteReview] User not logged in");
            return;
          }
      
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [deleteReview] Missing access token");
            return;
          }
      
          const response = await axiosInstance.delete(
            "/review/delete",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                accept: "*/*",
                "Content-Type": "application/json",
              },
              data: {
                userId,
                reviewId,
              },
            }
          );
      
          // Cập nhật store sau khi xóa review
          set((state) => ({
            data: {
              ...state.data,
              products: state.data.products?.map((product) =>
                product.reviews
                  ? {
                      ...product,
                      reviews: product.reviews.filter((review) => review.reviewId !== reviewId),
                      totalReviews: (product.totalReviews || 0) - 1, // Giảm tổng số đánh giá
                    }
                  : product
              ),
            },
          }));
      
          console.log("✅ [deleteReview] Review deleted successfully:", response.data);
        } catch (error) {
          console.error("❌ [deleteReview] Error deleting review:", error);
        }
      };
      

      const addReviewToProduct = async (proId: number, review: Omit<ProductReview, 'reviewId' | 'isDelete' | 'dateDeleted' | 'dateUpdated' | 'dateCreated'>) => {
        try {
          const userId = get().userId;
          if (!userId) {
            console.error("❌ [addReviewToProduct] User not logged in");
            return;
          }

          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [addReviewToProduct] Missing access token");
            return;
          }

          const response = await axiosInstance.post(
            "/review/create",
            {
              userId,
              proId,
              content: review.content,
              ratingStart: review.ratingStart,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const newReview: ProductReview = {
            ...response.data, // Lấy dữ liệu từ API trả về
            isDelete: false,
            dateDeleted: null,
            dateUpdated: null,
          };

          // Cập nhật store với đánh giá mới
          set((state) => ({
            data: {
              ...state.data,
              products: state.data.products?.map((product) =>
                product.proId === proId
                  ? {
                    ...product,
                    reviews: [newReview, ...(product.reviews || [])],
                    totalReviews: (product.totalReviews || 0) + 1, // Cập nhật tổng số đánh giá
                  }
                  : product
              ),
            },
          }));

          console.log("✅ [addReviewToProduct] Review added successfully:", newReview);
        } catch (error) {
          console.error("❌ [addReviewToProduct] Error adding review:", error);
        }
      };

      const editReview = async (review: Omit<ProductReview,  'isDelete' | 'dateDeleted' | 'dateUpdated' | 'dateCreated'>) => {
        try {
          const userId = get().userId;
          if (!userId) {
            console.error("❌ [editReview] User not logged in");
            return;
          }
      
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [editReview] Missing access token");
            return;
          }
      
          // Gửi request PUT để cập nhật review
          const response = await axiosInstance.put(
            "/review/update",
            {
              reviewId: review.reviewId,    // Đảm bảo reviewId có mặt
              userId: review.userId,
              proId: review.proId,
              content: review.content,
              ratingStart: review.ratingStart,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
      
          // Cập nhật review từ API response
          const updatedReview: ProductReview = {
            ...response.data,  // Dữ liệu trả về từ API
            isDelete: false,  // Đảm bảo trạng thái isDelete là false
            dateDeleted: null, // Đảm bảo dateDeleted là null
            dateUpdated: response.data.dateUpdated || new Date().toISOString(),  // Nếu không có dateUpdated từ API thì dùng thời gian hiện tại
          };
      
          // Cập nhật lại store với đánh giá đã chỉnh sửa
          set((state) => ({
            data: {
              ...state.data,
              products: state.data.products?.map((product) =>
                product.proId === review.proId
                  ? {
                      ...product,
                      reviews: product.reviews?.map((r) =>
                        r.reviewId === review.reviewId ? updatedReview : r
                      ),
                    }
                  : product
              ),
            },
          }));
      
          console.log("✅ [editReview] Review updated successfully:", updatedReview);
        } catch (error) {
          console.error("❌ [editReview] Error updating review:", error);
        }
      };
      

      const fetchUserCoin = async () => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) return;

          const response = await axiosInstance.post(
            "/user-coin/get-coin",
            { id: userId },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          set((state) => ({
            data: { ...state.data, userCoin: response.data.body.pointCoin },
          }));

          console.log("✅ [After Fetch] User Coin:", response.data.body.pointCoin);
        } catch (error) {
          console.error("❌ [fetchUserCoin] Error fetching user coin:", error);
        }
      };

      const fetchUserInfo = async () => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) return;
          const response = await axiosInstance.get(`/user/info/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          set((state) => ({
            data: { ...state.data, userInfo: response.data },
          }));
        } catch (error) {
          console.error("❌ [fetchUserInfo] Error fetching user info:", error);
        };

      };

      const fetchFavoriteItems = async () => {
        const userId = get().userId;
        if (!userId) {
          console.warn("⚠️ [fetchFavoriteItems] User ID is missing!");
          return;
        }
      
        try {
          const language = get().language;
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [fetchFavoriteItems] Missing access token!");
            return;
          }
      
          console.log(`🌍 [fetchFavoriteItems] Checking favorite list for user: ${userId}`);
      
          // 🛠 Kiểm tra xem người dùng có danh sách yêu thích chưa
          let favId: number | null = null;
          try {
            const checkFavResponse = await axiosInstance.get(`/fav/list-fav/${userId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
      
            favId = checkFavResponse.data?.favId || null;
            console.log(`✅ [fetchFavoriteItems] Found existing favorite list ID: ${favId}`);
          } catch (error) {
            console.warn(`⚠️ [fetchFavoriteItems] No favorite list found for user: ${userId}`);
          }
      
          console.log(`🔍 [fetchFavoriteItems] favId after checking: ${favId}`);
      
          // 🆕 Nếu chưa có danh sách yêu thích, tạo mới
          if (!favId) {
            try {
              console.log(`🆕 [fetchFavoriteItems] Creating new favorite list for user: ${userId}`);
      
              const createFavResponse = await axiosInstance.post(
                `/fav/create`,
                { userId },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
      
              favId = createFavResponse.data.body.favId;
              console.log(`✅ [fetchFavoriteItems] Created new favorite list with ID: ${favId}`);
            } catch (error) {
              console.error("❌ [fetchFavoriteItems] Error creating new favorite list:", error);
              return;
            }
          }
      
          console.log(`📌 [fetchFavoriteItems] Final favId before fetching items: ${favId}`);
      
          // ✅ Fetch danh sách mục yêu thích
          console.log(`📥 [fetchFavoriteItems] Fetching favorite items for favId: ${favId}`);
      
          const favItemsResponse = await axiosInstance.get<FavoriteResponse>(
            `/fav/list-favItem/${favId}?language=${language}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
      
          const favoriteItems = favItemsResponse.data.favouriteItemResponseList || [];
      
          // ✅ Cập nhật trạng thái sản phẩm với isFavourited
          const products = get().data.products || [];
          const updatedProducts = products.map((product) => ({
            ...product,
            isFavourited: favoriteItems.some((favItem) => favItem.proId === product.proId),
          }));
      
          // ✅ Cập nhật store
          set((state) => ({
            data: {
              ...state.data,
              favoriteItems,
              products: updatedProducts,
            },
          }));
      
        } catch (error) {
          console.error("❌ [fetchFavoriteItems] Error fetching favorite items:", error);
        }
      };
      

      const insertFavoriteItem = async (favId: number, proId: number, size: string) => {
        try {
          const userId = get().userId;
          if (!userId) {
            console.error("❌ [insertFavoriteItem] User not logged in");
            return;
          }

          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [insertFavoriteItem] Missing access token");
            return;
          }

          console.log("📤 Sending request with:", { userId, favId, proId, size });

          const response = await axiosInstance.post(
            "/fav-item/insert",
            { userId, favId, proId, size },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          console.log("✅ [insertFavoriteItem] Success:", response.data);

          // 🆕 Fetch lại danh sách yêu thích ngay sau khi thêm
          await fetchFavoriteItems();

        } catch (error: any) {
          console.error("❌ [insertFavoriteItem] Error:", error.response?.status, error.response?.data || error.message);
        }
      };

      

      const deleteAllFavItem = async (favId: number) => {
        try {
          console.log("ℹ️ [deleteAllFavItem] Start deleting favorite items, favId:", favId);
      
          const userId = get().userId;
          if (!userId) {
            console.error("❌ [deleteAllFavItem] User not logged in");
            return;
          }
          console.log("✅ [deleteAllFavItem] User ID:", userId);
      
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [deleteAllFavItem] Missing access token");
            return;
          }
          console.log("✅ [deleteAllFavItem] Access token retrieved");
      
          console.log("🔄 [deleteAllFavItem] Sending DELETE request to API...");
          const response = await axiosInstance.delete(`/fav/delete-allItem/${favId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: { userId, favId }, // Gửi dữ liệu trong body
          });
      
          console.log("✅ [deleteAllFavItem] API Response:", response.data);
      
          // Cập nhật store: Xóa danh sách yêu thích và cập nhật trạng thái sản phẩm
          set((state) => ({
            data: {
              ...state.data,
              favoriteItems: [],
              products: state.data.products?.map((product) => ({
                ...product,
                isFavourited: false,
              })),
            },
          }));
      
          console.log("✅ [deleteAllFavItem] Deleted all favorite items successfully");
        } catch (error) {
          console.error("❌ [deleteAllFavItem] Error deleting all favorite items:", error);
         
        }
      };

      const deleteFavItem = async (favItemId: number) => {
        try {
          console.log("ℹ️ [deleteFavItem] Start deleting favorite item, favItemId:", favItemId);
      
          const userId = get().userId;
          if (!userId) {
            console.error("❌ [deleteFavItem] User not logged in");
            return;
          }
          console.log("✅ [deleteFavItem] User ID:", userId);
      
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [deleteFavItem] Missing access token");
            return;
          }
          console.log("✅ [deleteFavItem] Access token retrieved");
      
          console.log("🔄 [deleteFavItem] Sending DELETE request to API...");
          const response = await axiosInstance.delete(`/fav-item/delete/${favItemId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            data: { userId, favItemId },
          });
      
          console.log("✅ [deleteFavItem] API Response:", response.data);
      
          // Cập nhật store: Xóa mục yêu thích khỏi danh sách và cập nhật trạng thái sản phẩm
          set((state) => ({
            data: {
              ...state.data,
              favoriteItems: state.data.favoriteItems?.filter((item) => item.favItemId !== favItemId) ?? [],
              products: state.data.products?.map((product) => ({
                ...product,
                isFavourited: false,
              })),
            },
          }));
      
          console.log("✅ [deleteFavItem] Deleted favorite item successfully");
        } catch (error) {
          console.error("❌ [deleteFavItem] Error deleting favorite item:", error);
        }
      };

      const checkTimeOrder = async () => {
        try {
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) {
            console.error("❌ [checkTimeOrder] Missing access token!");
            return;
          }
      
          console.log("🔍 [checkTimeOrder] Checking order expiration status...");
      
          // Call the API to check the order expiration
          const response = await axiosInstance.get(
            '/orders/check-time',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                accept: '*/*',
              },
            }
          );
      
          // Assuming the API responds with a status indicating if the order is expired or not
          if (response.status === 200) {
            console.log("✅ [checkTimeOrder] Order status check successful.");
            // Handle the response here (e.g., check if the order has expired)
          } else {
            console.error(`❌ [checkTimeOrder] Error: ${response.statusText}`);
          }
        } catch (error) {
          console.error("❌ [checkTimeOrder] Error checking order time:", error);
        }
      };
      
      
      const logout = async () => {
        try {
          console.log("🔴 Logging out...");

          await AsyncStorage.removeItem("access_token");

          useCartStore.getState().cart = [];
          useCartStore.getState().cartTotal = 0;
          useCartStore.getState().currentCartId = null; // hoặc 0 nếu bạn thích
          useCartStore.getState().selectedVoucher = {
            selectedVoucherId: null,
            selectedVoucherKey: null,
            selectedVoucherDiscountAmount: 0,
          };
          useCartStore.getState().idCartPause = null;
          useCartStore.getState().idOrderPause = null;
          useCartStore.getState().groupCartId = null;
          useCartStore.getState().hasRejectedGroupCart= false;
          useCartStore.getState().groupCartData = null;
          useCartStore.getState().hasGroupCart = false;
          set((state) => {
            const newState = {
              userId: null,
              data: {
                categories: [],
                products: [],
                posts: [],
                userInfo: undefined,
                userCoin: 0,
                favoriteItems: [],
              },
            };

            console.log("🔍 New state after logout:", newState);
            return newState;
          });

          console.log("✅ Logout successful!");

        } catch (error) {
          console.error("❌ [logout] Error logging out:", error);
        }
      }

      return {
        data: {},
        userId: null,
        language: 'VN',
        fetchProductReviews,
        addReviewToProduct,
        insertFavoriteItem,
        deleteAllFavItem,
        fetchProducts,
        logout,
        fetchFavoriteItems,
        checkShipment,
        deleteFavItem,
        editReview,
        deleteReview,
        checkTimeOrder,
        checkVoucher,
        fetchUserCoin,

        setUserId: async (id) => {
          set({ userId: id });
          if (id !== null) {
            await Promise.all([
              fetchCategories(),
              fetchUserInfo(),
              fetchUserCoin(),
              fetchFavoriteItems(),
              fetchProducts(),
              checkTimeOrder(),
              checkVoucher(),
            ]);
          
            useCartStore.getState().fetchCartItem();
            useCartStore.getState().updateCartTotal();
          }
        },
        
        setLanguage: async (lang) => {
          try {
            set({ language: lang });

            await AsyncStorage.setItem("language", lang);
            await i18n.changeLanguage(lang);

            console.log("🌍 Language changed to:", lang);

            // ✅ Đặt lại data về rỗng trước khi fetch
            set((state) => ({
              data: {
                categories: [],
                products: [],
                posts: [],
                userInfo: state.data.userInfo, // Giữ lại thông tin user
                userCoin: state.data.userCoin, // Giữ lại số coin của user
                favoriteItems: [], // Xóa danh sách yêu thích

              },
            
              
            }));

            // 🔄 Fetch lại dữ liệu theo ngôn ngữ mới
            await Promise.all([
              fetchCategories(),
              fetchProducts(), // ✅ Lấy lại danh sách sản phẩm theo ngôn ngữ mới
              fetchPosts(),
              fetchFavoriteItems(), // ✅ Cập nhật danh sách yêu thích theo ngôn ngữ mới
              checkTimeOrder(),
            ]);

            useCartStore.getState().fetchCartItem();

          } catch (error) {
            console.error("❌ Error updating language:", error);
          }
        },
      };
    },
    {
      name: "category-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);