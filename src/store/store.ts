import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/i18n';

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
  totalReviews?: number; // 👈 Thêm trường này
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
          console.log("✅ [After Fetch] Categories:", response.data.categoryResponseList);
        } catch (error) {
          console.error("❌ [fetchCategories] Error fetching categories:", error);
        }
      };

      const fetchPosts = async () => {
        try {
          const lang = get().language;
          console.log(`🌍 [fetchPosts] Fetching with language: ${lang}`);
          const response = await axiosInstance.get(`/post/view/all/desc?page=1&limit=4&language=${lang}`);
          set((state) => ({
            data: { ...state.data, posts: response.data.listPosts || [] },
          }));
          console.log("✅ [After Fetch] Posts:", response.data.listPosts);
        } catch (error) {
          console.error("❌ [fetchPosts] Error fetching posts:", error);
        }
      };

      const fetchProductReviews = async (proId: number, page: number = 1, limit: number = 5) => {
        try {
          const response = await axiosInstance.get(`/product/list-review?proId=${proId}&page=${page}&limit=${limit}`);
          const { listReviews, total } = response.data;

          set((state) => {
            const product = state.data.products?.find((p) => p.proId === proId);
            if (!product) return state;

            // 🛑 Tránh lỗi undefined
            const existingReviews = product.reviews || [];

            // 🔹 Gộp danh sách và loại bỏ review trùng
            const uniqueReviews = Array.from(
              new Map([...existingReviews, ...listReviews].map((r) => [r.reviewId, r])).values()
            );

            // 🔍 Debug: Kiểm tra keys trước khi cập nhật
            const reviewKeys = uniqueReviews.map((r) => r.reviewId);
            console.log("✅ Unique Review Keys:", reviewKeys);

            return {
              data: {
                ...state.data,
                products: state.data.products?.map((p) =>
                  p.proId === proId
                    ? {
                      ...p,
                      reviews: uniqueReviews, // ✅ Không còn trùng key
                      totalReviews: total,
                    }
                    : p
                ),
              },
            };
          });

          console.log(`✅ [fetchProductReviews] Loaded page ${page} for product ${proId}. Total reviews: ${total}`);
        } catch (error) {
          console.error(`❌ [fetchProductReviews] Error fetching reviews for product ${proId}:`, error);
        }
      };



      const fetchProducts = async () => {
        try {
          const lang = get().language;
          console.log(`🌍 [fetchProducts] Fetching with language: ${lang}`);

          const response = await axiosInstance.get(`/product/list-product?page=1&limit=6&language=${lang}`);
          const products = response.data.productResponses || [];

          set((state) => ({
            data: { ...state.data, products },
          }));

          console.log("✅ [After Fetch] Products:", products);

          // Fetch rating cho từng sản phẩm sau khi lấy danh sách sản phẩm
          for (const product of products) {
            await fetchProductRating(product.proId);
          }
        } catch (error) {
          console.error("❌ [fetchProducts] Error fetching products:", error);
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
        console.log(`🔍 [fetchFavoriteItems] userId:`, userId); // Log userId

        if (!userId) return;

        try {
          const language = get().language;
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) return;

          console.log(`🌍 [fetchFavoriteItems] Fetching favorites with language: ${language}`);

          const response = await axiosInstance.get<FavoriteResponse>(
            `/fav/list-favItem/${userId}?language=${language}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          set((state) => ({
            data: { ...state.data, favoriteItems: response.data.favouriteItemResponseList || [] },
          }));

          console.log("✅ [After Fetch] Favorite Items:", response.data.favouriteItemResponseList);
        } catch (error) {
          console.error("❌ [fetchFavoriteItems] Error fetching favorite items:", error);
        }
      };

      const fetchProductRating = async (proId: number) => {
        try {
          console.log(`🔍 [fetchProductRating] Fetching rating for product ID: ${proId}`);

          const response = await axiosInstance.get(`/product/list-rating`);
          const ratingList = response.data.list || [];

          // Lọc ra rating của sản phẩm có proId tương ứng
          const foundRating = ratingList.find((r: { proId: number }) => r.proId === proId);
          const avgRating = foundRating ? foundRating.avgRating : 0;

          set((state) => ({
            data: {
              ...state.data,
              products: state.data.products?.map((product) =>
                product.proId === proId ? { ...product, avgRating } : product
              ),
            },
          }));

          console.log(`✅ [fetchProductRating] Updated avgRating for product ${proId}: ${avgRating}`);
        } catch (error) {
          console.error(`❌ [fetchProductRating] Error fetching rating for product ${proId}:`, error);
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
      
          const response = await axiosInstance.post(
            "/fav-item/insert",
            { userId, favId, proId, size },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
      
          const newFavoriteItem: FavoriteItem = response.data;
      
          // Cập nhật store với mục yêu thích mới
          set((state) => ({
            data: {
              ...state.data,
              favoriteItems: [...(state.data.favoriteItems || []), newFavoriteItem],
            },
          }));
      
          console.log("✅ [insertFavoriteItem] Added favorite item:", newFavoriteItem);
        } catch (error) {
          console.error("❌ [insertFavoriteItem] Error adding favorite item:", error);
        }
      };
      


      return {
        data: {},
        userId: null,
        language: 'VN',
        fetchProductReviews,
        addReviewToProduct,
        insertFavoriteItem,


        setUserId: async (id) => {
          set({ userId: id });
          if (id !== null) {
            await Promise.all([
              fetchUserInfo(),
              fetchUserCoin(),
              fetchFavoriteItems(), // Gọi thêm hàm này khi user đăng nhập
            ]);
          }
        },

        setLanguage: async (lang) => {
          try {
            set({ language: lang });
            await AsyncStorage.setItem("language", lang);
            await i18n.changeLanguage(lang);

            console.log("🌍 Language changed to:", lang);

            await Promise.all([
              fetchCategories(),
              fetchProducts(),
              fetchPosts(),
              fetchFavoriteItems(), // Fetch lại danh sách yêu thích khi đổi ngôn ngữ
            ]);
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


