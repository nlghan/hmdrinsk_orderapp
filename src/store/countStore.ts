
import { create } from "zustand";

type CountStore = {
  orderCount: number;
  setOrderCount: (count: number) => void;
};

export const useOrderStore = create<CountStore>((set) => ({
  orderCount: 0,
  setOrderCount: (count) => set({ orderCount: count }),
}));


type CountStorePending = {
    orderCountPending: number;
    setOrderCountPending: (count: number) => void;
  };
  
  export const useOrderStorePending = create<CountStorePending>((set) => ({
    orderCountPending: 0,
    setOrderCountPending: (count) => set({ orderCountPending: count }),
}));

type CountStoreCancelled = {
    orderCountCancelled: number;
    setOrderCountCancelled: (count: number) => void;
  };
  
  export const useOrderStoreCancelled = create<CountStoreCancelled>((set) => ({
    orderCountCancelled: 0,
    setOrderCountCancelled: (count) => set({ orderCountCancelled: count }),
}));

type CountStoreWaiting = {
    orderCountWaiting: number;
    setOrderCountWaiting: (count: number) => void;
  };
  
  export const useOrderStoreWaiting = create<CountStoreWaiting>((set) => ({
    orderCountWaiting: 0,
    setOrderCountWaiting: (count) => set({ orderCountWaiting: count }),
}));

type CountStoreRefund = {
    orderCountRefund: number;
    setOrderCountRefund: (count: number) => void;
  };
  
  export const useOrderStoreRefund = create<CountStoreRefund>((set) => ({
    orderCountRefund: 0,
    setOrderCountRefund: (count) => set({ orderCountRefund: count }),
=======
import { create } from "zustand";

type CountStore = {
  orderCount: number;
  setOrderCount: (count: number) => void;
};

export const useOrderStore = create<CountStore>((set) => ({
  orderCount: 0,
  setOrderCount: (count) => set({ orderCount: count }),
}));


type CountStorePending = {
    orderCountPending: number;
    setOrderCountPending: (count: number) => void;
  };
  
  export const useOrderStorePending = create<CountStorePending>((set) => ({
    orderCountPending: 0,
    setOrderCountPending: (count) => set({ orderCountPending: count }),
}));

type CountStoreCancelled = {
    orderCountCancelled: number;
    setOrderCountCancelled: (count: number) => void;
  };
  
  export const useOrderStoreCancelled = create<CountStoreCancelled>((set) => ({
    orderCountCancelled: 0,
    setOrderCountCancelled: (count) => set({ orderCountCancelled: count }),
}));

type CountStoreWaiting = {
    orderCountWaiting: number;
    setOrderCountWaiting: (count: number) => void;
  };
  
  export const useOrderStoreWaiting = create<CountStoreWaiting>((set) => ({
    orderCountWaiting: 0,
    setOrderCountWaiting: (count) => set({ orderCountWaiting: count }),
}));

type CountStoreRefund = {
    orderCountRefund: number;
    setOrderCountRefund: (count: number) => void;
  };
  
  export const useOrderStoreRefund = create<CountStoreRefund>((set) => ({
    orderCountRefund: 0,
    setOrderCountRefund: (count) => set({ orderCountRefund: count }),

}));