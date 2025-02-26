import { Product } from "../screens/ProductDetail";

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Main: undefined; // Thay vì Home, ta dùng Main để chứa TabNavigator
    ProductDetail: { product: Product };
    LanguageChange:  undefined;
    AllReviews: { productId: number };  // 👈 Thêm dòng này
    AddReview: { productId: number };
  };
  