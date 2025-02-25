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

interface Product {
  proId: number;
  cateId: number;
  proName: string;
  description: string;
  productImageResponseList: ProductImage[];
  listProductVariants: ProductVariant[];
  deleted: boolean;
}

interface DataStore {
  categories?: Category[];
  products?: Product[];
  posts?: Post[];
  userInfo?: UserInfo;
  userCoin?: number;
}

interface CategoryStore {
  data: DataStore;
  userId: number | null;
  language: string;
  setUserId: (id: number | null) => void;
  setLanguage: (lang: string) => void;
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

      const fetchProducts = async () => {
        try {
          const lang = get().language;
          console.log(`🌍 [fetchProducts] Fetching with language: ${lang}`);
          const response = await axiosInstance.get(`/product/list-product?page=1&limit=6&language=${lang}`);
          set((state) => ({
            data: { ...state.data, products: response.data.productResponses || [] },
          }));
          console.log("✅ [After Fetch] Products:", response.data.productResponses);
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
        }
      };

      return {
        data: {},
        userId: null,
        language: 'VN',

        setUserId: async (id) => {
          set({ userId: id });
          if (id !== null) {
            await fetchUserInfo();
            await fetchUserCoin();
          }
        },

        setLanguage: async (lang) => {
          try {
            set({ language: lang });
            await AsyncStorage.setItem("language", lang);
            await i18n.changeLanguage(lang);

            console.log("🌍 Language changed to:", lang);

            // ✅ Fetch lại dữ liệu theo ngôn ngữ mới
            await Promise.all([fetchCategories(), fetchProducts(), fetchPosts()]);
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
