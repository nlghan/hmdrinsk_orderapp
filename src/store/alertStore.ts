// store/alertStore.ts
import { create } from 'zustand';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showAlert: (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  onConfirm: undefined,
  onCancel: undefined,

  showAlert: (title, message, onConfirm, onCancel) =>
    set({
      visible: true,
      title,
      message,
      onConfirm,
      onCancel,
    }),

  hideAlert: () =>
    set({
      visible: false,
      title: '',
      message: '',
      onConfirm: undefined,
      onCancel: undefined,
    }),
}));
