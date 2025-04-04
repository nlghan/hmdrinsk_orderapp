import { StyleSheet } from "react-native";
import { COLORS, FONTFAMILY } from "../theme/theme";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    position: "relative",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily:FONTFAMILY.lobster_regular,
    textAlign: 'center', // Căn giữa văn bản trong Text
    flex: 1, // Giúp chữ "Giỏ hàng" mở rộng để căn giữa
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  autocompleteWrapper: {
    marginBottom: 70,
    zIndex: 20,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  listContainer: {
    position: "absolute",
    top: 50,
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    elevation: 5,
  },
  autocompleteItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#ffffff",
    
  },
  textName:{
    fontSize:24,
    lineHeight:16,
    fontFamily:FONTFAMILY.dongle_regular,
  },
  removeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    transform: [{ translateY: -10 }],
    padding: 5,
    borderRadius: 15,
  },
  removeButtonText: {
    color: "red",
    fontSize: 25,
    fontWeight: "bold",
  },
  voucherWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  voucherList: {
    maxHeight: '75%',
  },
  voucherItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f2fffa",
  },
  selectedVoucher: {
    borderColor: "#ff3b30",
    backgroundColor: "#ffeeee",
  },
  voucherText: {
    marginLeft: 12,
    flex: 1,
  },
  voucherTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  voucherStatus: {
    color: "#777",
    fontSize: 14,
  },
  confirmButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: "black",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#ff3b30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledVoucher: {
    backgroundColor: "#ddd",
    borderColor: "#ccc",
  },
  disabledText: {
    color: "#888",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Căn giữa nội dung theo chiều ngang
    marginBottom: 10,
  },

  noVoucherText: {
    textAlign: "center",
    fontSize: 16,
    color: "red",
  },
  voucherList: {
    marginBottom: 20,
  },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: '#f2fffa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voucherImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGreen,
  },
  voucherAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#00796b',
    marginVertical: 5,
  },
  voucherDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  claimButton: {
    backgroundColor:'#50b495',
    borderRadius: 5,
    paddingVertical: 8,
    marginTop: 10,
    alignItems: "center",
  },
  claimButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  selectedVoucher: {
    borderWidth: 2,
    borderColor: COLORS.primaryGreenHex,
  },
  disabledVoucher: {
   backgroundColor:'#efefef'
  },
});

export default styles;
