import { Product } from "../screens/ProductDetail";

export type RootStackParamList = {

    Home: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    News: undefined;
    NewDetails: { postId: number };
    Main: undefined; // Thay vì Home, ta dùng Main để chứa TabNavigator
    ProductDetail: { product: Product };
    LanguageChange:  undefined;
    AllReviews: { productId: number };  // 👈 Thêm dòng này
    AddReview: { productId: number };
    Info: undefined;
    Order:undefined;
    Cart:undefined;
    ListVoucher: undefined
    HistoryOrders: undefined;
    DeliveringOrders: undefined;
    PendingOrders: undefined;
    CancelledOrders: undefined;
    WaitingOrders: undefined;
    RefundOrders: undefined;
    MyOrderDetails: { shipmentId: number };
    ChatWithShipper: { shipmentId: number };
    Orther: undefined;
    Payment: undefined;
    OrderComplete:undefined;
    Notification: { userId: number } | undefined;
  };
  