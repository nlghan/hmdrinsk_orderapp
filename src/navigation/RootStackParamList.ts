import { Product } from "../screens/ProductDetail";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Info: undefined;
  ProductDetail: { product: Product };
  News: undefined;
  NewDetails: undefined;
  Order:undefined;
  LanguageChange: undefined;
  AllReviews: { productId: number };
  AddReview: { productId: number };
  Cart:undefined;
  ListVoucher: undefined
  HistoryOrders: undefined;
  DeliveringOrders: undefined;
  PendingOrders: undefined;
  Orther: undefined;
  CancelledOrders: undefined;
  WaitingOrders: undefined;
  MyOrderDetails: { shipmentId: number };
  RefundOrders: undefined;
  };
  