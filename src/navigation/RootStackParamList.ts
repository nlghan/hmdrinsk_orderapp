import { Product } from "../screens/ProductDetail";
import { ProductReview } from "../screens/AllReviews"

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
    AddReview: { productId: number; reviewToEdit?: ProductReview };
    Info: undefined;
    Order: { state: { cateId: number } };
    Cart:undefined;
    ListVoucher: undefined
    HistoryOrders: undefined;
    DeliveringOrders: undefined;
    PendingOrders: undefined;
    CancelledOrders: undefined;
    WaitingOrders: undefined;
    RefundOrders: undefined;
    MyOrderDetails: { shipmentId: number };
    Orther: undefined;
    Payment: { orderId: number };
    OrderComplete:undefined;
    OrderFailed:undefined;
    Notification: { userId: number } | undefined;
    ChatWithShipper: { shipmentId: number };
    Search: undefined;
  };
  