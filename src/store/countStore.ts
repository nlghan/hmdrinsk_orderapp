import { create } from 'zustand';

interface NotificationWS {
  userId: number;
  shipmentId: number;
  message: string;
  time: string;
}

interface CountStore {
  socketNotifications: NotificationWS[];
  refreshTrigger: number; // Trigger để kích hoạt fetch lại
  setSocketNotifications: (notifications: NotificationWS[]) => void;
  triggerRefresh: () => void; // Hàm để kích hoạt fetch lại
}

export const useCountStore = create<CountStore>((set) => ({
  socketNotifications: [],
  refreshTrigger: 0,
  setSocketNotifications: (notifications) =>
    set({
      socketNotifications: notifications.slice(-50), // Giới hạn tối đa 50 thông báo để tối ưu
    }),
  triggerRefresh: () =>
    set((state) => ({
      refreshTrigger: state.refreshTrigger + 1, // Tăng trigger để kích hoạt useEffect
    })),
}));