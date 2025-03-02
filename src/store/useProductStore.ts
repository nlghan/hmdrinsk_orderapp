import { create } from 'zustand';
import { useGlobalStore } from './store';
import axiosInstance from '../utils/axiosInstance';

/** Interface định nghĩa cho ảnh sản phẩm */
export interface ProductImage {
  id: number;
  linkImage: string;
}

/** Interface định nghĩa cho biến thể sản phẩm */
export interface ProductVariant {
  varId: number;
  proId: number;
  size: string;
  price: number;
  stock: number;
  deleted: boolean;
}

/** Interface định nghĩa cho đánh giá sản phẩm */
export interface ProductReview {
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

/** Interface định nghĩa cho sản phẩm */
export interface Product {
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
  isFavourited?: boolean;
}

/** Interface cho Product Store */
interface ProductStore {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  fetchProductReviews: (proId: number, page?: number, limit?: number) => Promise<void>;
  fetchProductRating: (proId: number) => Promise<void>;
}

/** Zustand Store để quản lý danh sách sản phẩm */
export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,

  /** Fetch danh sách sản phẩm từ API */
  fetchProducts: async () => {
    const { language, favoriteStore } = useGlobalStore.getState(); // ✅ Lấy language từ GlobalStore
    set({ loading: true });

    try {
      const response = await axiosInstance.get(`/product/list-product-android?language=${language}`);
      console.log("📥 Raw API response:", response.data);

      let newProducts: Product[] = response.data.productResponses?.map((product: any) => ({
        proId: product.proId,
        cateId: product.cateId,
        proName: product.proName,
        description: product.description,
        deleted: product.deleted,
        productImageResponseList: product.productImageResponseList?.map((img: any) => ({
          id: img.id,
          linkImage: img.linkImage
        })) || [],
        listProductVariants: product.listProductVariants?.map((variant: any) => ({
          varId: variant.varId,
          proId: product.proId,
          size: variant.size,
          price: variant.price,
          stock: variant.stock,
          deleted: variant.deleted
        })) || [],
        isFavourited: favoriteStore.favoriteItems?.some((fav) => fav.proId === product.proId) ?? false,
      })) || [];

      console.log("✅ Processed products:", newProducts);
      set({ products: newProducts });

      // Fetch rating cho từng sản phẩm
      for (const product of newProducts) {
        await get().fetchProductRating(product.proId);
      }

    } catch (error) {
      console.error("❌ [fetchProducts] Error fetching products:", error);
    } finally {
      set({ loading: false });
    }
  },

  /** Fetch đánh giá của sản phẩm */
  fetchProductReviews: async (proId, page = 1, limit = 5) => {
    try {
      const response = await axiosInstance.get(`/product/list-review?proId=${proId}&page=${page}&limit=${limit}`);
      const { listReviews, total } = response.data;

      set((state) => ({
        products: state.products.map((product) =>
          product.proId === proId ? { ...product, reviews: listReviews, totalReviews: total } : product
        )
      }));

      console.log(`✅ [fetchProductReviews] Loaded page ${page} for product ${proId}. Total reviews: ${total}`);
    } catch (error) {
      console.error(`❌ [fetchProductReviews] Error fetching reviews for product ${proId}:`, error);
    }
  },

  /** Fetch đánh giá trung bình của sản phẩm */
  fetchProductRating: async (proId) => {
    try {
      console.log(`🔍 [fetchProductRating] Fetching rating for product ID: ${proId}`);

      const response = await axiosInstance.get(`/product/list-rating`);
      const ratingList = response.data.list || [];
      const foundRating = ratingList.find((r: { proId: number }) => r.proId === proId);
      const avgRating = foundRating ? foundRating.avgRating : 0;

      set((state) => ({
        products: state.products.map((product) =>
          product.proId === proId ? { ...product, avgRating } : product
        )
      }));

      console.log(`✅ [fetchProductRating] Updated avgRating for product ${proId}: ${avgRating}`);
    } catch (error) {
      console.error(`❌ [fetchProductRating] Error fetching rating for product ${proId}:`, error);
    }
  },
}));
