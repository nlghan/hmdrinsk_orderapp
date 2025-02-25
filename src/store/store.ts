import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface Category {
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

interface CategoryStore {
  categories: Category[];
  products: Product[];
  posts: Post[];
  userId: number | null;
  userInfo: UserInfo | null;
  setUserId: (id: number | null) => void;
  fetchCategories: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchPosts: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      products: [],
      posts: [], 
      userId: null,
      userInfo: null,

      setUserId: async (id) => {
        set({ userId: id });

        if (id !== null) {
          await get().fetchUserInfo(); // Fetch user info khi userId thay đổi
        }
      },

      fetchCategories: async () => {
        try {
          const response = await axiosInstance.get('/cate/list-category?page=1&limit=100&language=VN');
          set({ categories: response.data.categoryResponseList || [] });
        } catch (error) {
          console.error('Lỗi khi tải danh mục:', error);
        }
      },

      fetchPosts: async () => {
        try {
          const response = await axiosInstance.get('/post/view/all/desc?page=1&limit=3&language=VN');
          set({ posts: response.data.listPosts || [] });
          console.log('Danh sách bài viết:', response.data.listPosts);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách bài viết:', error);
        }
      },

      fetchProducts: async () => {
        try {
         
          const response = await axiosInstance.get('/product/list-product?page=1&limit=6&language=VN');

          set({ products: response.data.productResponses || [] });

          console.log('Danh sách sản phẩm:', response.data.productResponses);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        }
      },

      fetchUserInfo: async () => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const accessToken = await AsyncStorage.getItem('access_token');
          if (!accessToken) {
            console.error('Không tìm thấy accessToken');
            return;
          }

          const response = await axiosInstance.get(`/user/info/${userId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          set({ userInfo: response.data });

          console.log('Thông tin user:', response.data);
        } catch (error) {
          console.error('Lỗi khi lấy thông tin user:', error);
        }
      },
    }),
    {
      name: 'category-store', // Tên lưu trữ trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
