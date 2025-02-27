import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

const styles = StyleSheet.create({
  categoryOrderContainer: {
    paddingVertical: 5, // Giảm padding
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12, // Giảm padding ngang
    borderRadius: 15,
    height:220, // Giảm chiều cao (hoặc bạn có thể thử 180, 160)
    marginBottom:10
  },
  categoryTitle: {
    fontSize: 18, // Giảm kích thước chữ tiêu đề
    fontWeight: "bold",
    color: "#333",
  },
  servicesOrder: {
    flexDirection: "row",   
  },
  serviceOrderItem: {
    paddingVertical: 5, // Giảm padding mỗi mục danh mục
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceOrderImage: {
    width: 50, // Giảm kích thước ảnh
    height: 50,
    borderRadius: 25, // Điều chỉnh bo tròn theo kích thước mới
    marginBottom: 3,
  },
  serviceOrderText: {
    fontSize: 13, // Giảm kích thước chữ danh mục
    fontWeight: "500",
  },
 
  imageWrapper: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.14)", // Lớp phủ màu đen 40%
    borderRadius: 25, // Bo tròn cùng hình ảnh
  },
  serviceOrderTextSelected: {
    color: "#fa9269", // Đổi màu khi được chọn
  },
  // 🔹 Thanh cuộn mượt hơn
  scrollBarContainer: {
    height: 6,
    width: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    alignSelf: "center",
    overflow: "hidden",
  },
  scrollBarIndicator: {
    height: "100%",
    width: 35,
    backgroundColor: "#ff914d",
    borderRadius: 10, // Bo tròn thanh trượt
    
  },

  productItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Bóng đổ trên Android
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  productPrice: {
    color: "#b12704",
    fontWeight: "bold",
    marginTop: 5,
  },
  productDesc: {
    color: "#666",
    fontSize: 14,
    marginVertical: 5,
  },
  addToCartButton: {
    backgroundColor: "#FF5722",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  loadMoreText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  
});

export default styles;
