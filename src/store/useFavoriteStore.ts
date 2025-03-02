import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteItem {
  favItemId: number;
  proId: number;
  size: string;
}

interface FavoriteStore {
  favoriteItems?: FavoriteItem[];
  fetchFavoriteItems: () => Promise<void>;
  insertFavoriteItem: (proId: number, size: string) => Promise<void>;
  deleteAllFavItem: () => Promise<void>;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favoriteItems: [],

  fetchFavoriteItems: async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

      const response = await axiosInstance.get(`/fav/list-favItem/${userId}`);
      set({ favoriteItems: response.data.favouriteItemResponseList || [] });
    } catch (error) {
      console.error("❌ [fetchFavoriteItems] Error:", error);
    }
  },

  insertFavoriteItem: async (proId, size) => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

      await axiosInstance.post("/fav-item/insert", { userId, proId, size });
      await get().fetchFavoriteItems();
    } catch (error) {
      console.error("❌ [insertFavoriteItem] Error:", error);
    }
  },

  deleteAllFavItem: async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

      await axiosInstance.delete(`/fav/delete-allItem/${userId}`);
      set({ favoriteItems: [] });
    } catch (error) {
      console.error("❌ [deleteAllFavItem] Error:", error);
    }
  },
}));
