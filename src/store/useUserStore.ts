import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  userId: number;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
}

interface UserStore {
  userInfo?: UserInfo;
  userCoin?: number;
  userId: number | null;
  fetchUserInfo: () => Promise<void>;
  fetchUserCoin: () => Promise<void>;
  logout: () => Promise<void>;
  setUserId: (id: number | null) => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userInfo: undefined,
      userCoin: 0,
      userId: null,

      fetchUserInfo: async () => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const accessToken = await AsyncStorage.getItem("access_token");
          if (!accessToken) return;
          const response = await axiosInstance.get(`/user/info/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          set({ userInfo: response.data });
        } catch (error) {
          console.error("❌ [fetchUserInfo] Error:", error);
        }
      },

      fetchUserCoin: async () => {
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

          set({ userCoin: response.data.body.pointCoin });
        } catch (error) {
          console.error("❌ [fetchUserCoin] Error:", error);
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem("access_token");
        set({ userId: null, userInfo: undefined, userCoin: 0 });
        console.log("✅ Logged out successfully!");
      },

      setUserId: async (id) => {
        set({ userId: id });
        if (id !== null) {
          await Promise.all([get().fetchUserInfo(), get().fetchUserCoin()]);
        }
      },
    }),
    { name: "user-storage", storage: createJSONStorage(() => AsyncStorage), }
  )
);
