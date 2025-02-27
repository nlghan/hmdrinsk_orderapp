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
  };
  