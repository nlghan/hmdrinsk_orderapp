import { create } from 'zustand';

interface NotificationWS {
  userId: number;
  shipmentId?: number | undefined;
  groupOrderId?: number;
  message: string;
  time: string;
  type?: string;
  id: number;
}

interface CountStore {
  socketNotifications: NotificationWS[];
  refreshTrigger: number;
  setSocketNotifications: (notifications: NotificationWS[]) => void;
  triggerRefresh: () => void;
}

export const useCountStore = create<CountStore>((set, get) => ({
  socketNotifications: [],
  refreshTrigger: 0,
  setSocketNotifications: (notifications) => {
    const newNotifications = notifications.slice(-50);
    const oldNotifications = get().socketNotifications;

    // So sánh nhanh id từng item để tránh cập nhật không cần thiết
    const isEqual = oldNotifications.length === newNotifications.length &&
      oldNotifications.every((item, idx) => item.id === newNotifications[idx].id);

    if (isEqual) return; // Không cập nhật nếu dữ liệu giống nhau

    set({ socketNotifications: newNotifications });
  },
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
