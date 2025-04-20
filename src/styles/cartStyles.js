import { StyleSheet } from 'react-native';
import {
    BORDERRADIUS,
    COLORS,
    FONTFAMILY,
    SPACING,
} from '../theme/theme';
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    coinInput: {
        
        height: 40,  // Chiều cao của input
        borderColor:'#ccc',  // Màu viền
        borderWidth: 1,  // Độ dày viền
        borderRadius: BORDERRADIUS.radius_10,  // Bo góc
        paddingHorizontal: 10,  // Khoảng cách giữa nội dung và viền
        fontSize: 14,  // Kích thước chữ
        color: '#000',  // Màu chữ
        backgroundColor: '#fff',  // Màu nền của input
        width:90
    },
    list: {
        paddingBottom: 30,
        paddingHorizontal: SPACING.space_12,
        paddingTop: 10,
        backgroundColor: '#f3ebe0',
        
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: BORDERRADIUS.radius_20,
        padding: SPACING.space_8,
        marginBottom: SPACING.space_12,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        marginTop:5
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: BORDERRADIUS.radius_15,
        marginRight: 10,
    },
    productInfo: {
        flex: 1,
        flexDirection: 'column',
    },
    productName: {
        fontSize: 26,
        color: COLORS.primaryDarkHex,
        fontFamily: FONTFAMILY.dongle_bold,
        lineHeight:20 
    },
    sizeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    sizeText: {
        fontSize: 24,
        fontFamily:FONTFAMILY.dongle_regular,
        lineHeight:20,
        color: COLORS.secondaryDarkHex,
    },
    discountPrice: {
        fontSize: 28,
        fontFamily:FONTFAMILY.dongle_bold,
        color: 'red',
        alignItems: 'flex-end',
        textAlign: 'left'
    },
    quantityContainer: {
        display:'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        gap: 5,
       
    },
    quantityButton: {
        backgroundColor: '#f0d9b5',
        padding: 4,
        borderRadius: 20,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 12,
    },
    footer: {
        padding: SPACING.space_8,
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: BORDERRADIUS.radius_20,
        elevation: 4,
    
    },
    voucherContainer: {
        backgroundColor: '#fff',
        padding: SPACING.space_12,
        borderRadius: BORDERRADIUS.radius_20,
        marginBottom: 5,
    },

    voucherButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    voucherText: {
        fontSize: 26,
        fontFamily:FONTFAMILY.dongle_bold,
        lineHeight:28,
        marginLeft: 10,
    },

    voucherChooseText: {
        fontSize: 22,
        fontFamily:FONTFAMILY.dongle_regular,
        lineHeight:16,
        color: COLORS.secondaryDarkHex,
    },

    coinContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: SPACING.space_12,
        borderRadius: BORDERRADIUS.radius_20,
        marginBottom: 5,
    },

    coinText: {
        fontSize: 26,
        fontFamily:FONTFAMILY.dongle_bold,
        lineHeight:26,
        marginLeft: 10,
        textAlign:'center'
    },

    coinToggle: {
        padding: 5,
    },

    paymentContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: SPACING.space_8,
        borderRadius: BORDERRADIUS.radius_20,
        height:80
    },

    selectAll: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    checkbox: {
        marginRight: 5,
    },

    coinLeft: {
        flexDirection: 'row',
       
    },

    selectAllText: {
        fontSize: 16,
    },

    totalText: {
        fontSize: 28,
        fontFamily:FONTFAMILY.dongle_regular,
        textAlign: 'center'
    },

    totalAmount: {
        fontSize: 32,
        ontFamily:FONTFAMILY.dongle_bold,
        color: 'red',
    },

    checkoutButton: {
        backgroundColor: '#D87D2A',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: BORDERRADIUS.radius_15,
        height:50
    },

    checkoutText: {
        fontSize: 24,
        color: '#fff',
        fontFamily:FONTFAMILY.dongle_bold,
    },
    voucherLabel: {
        display: 'flex',
        flexDirection: 'row'
    },
    voucherRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Khoảng cách giữa text và icon
    },

    closeIcon: {
        marginLeft: 5,
        padding: 5, // Tăng vùng bấm
        backgroundColor: '#ddd', // Màu nền nhạt cho dễ bấm
        borderRadius: 10,
    },
    flatlistContainer: {
        flex: 1,
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Căn giữa nội dung theo chiều ngang
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 25,
        fontFamily:FONTFAMILY.lobster_regular,
        textAlign: 'center', // Căn giữa văn bản trong Text
        flex: 1, // Giúp chữ "Giỏ hàng" mở rộng để căn giữa
    },  
    quantityInput: {
        width: 50,
        height: 30,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
        borderRadius: 5,
        fontSize: 16,
        padding: 5,
    },
    swipeActions: {
        backgroundColor: COLORS.lightGray,
        padding: SPACING.medium,
        justifyContent: 'center',
        borderRadius: BORDERRADIUS.medium,
        marginRight: SPACING.small,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.small,
      
    },
    checkbox: {
        marginRight: SPACING.small,
    },
    selectButton: {
      
        paddingVertical: SPACING / 2,
        paddingHorizontal: SPACING * 1.5,
        borderRadius: BORDERRADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        padding:13
    },
    buttonText: {
        
        fontSize: 20,
        fontFamily: FONTFAMILY.bold,
    },
    picker: {
        height: 40, // Height of the picker
        width: 40, // Width of the picker (adjust as needed)
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: BORDERRADIUS.radius_10, // Match your radius styling
        paddingHorizontal: SPACING.spacing_10,
        marginRight: SPACING.spacing_10,
      },
      noteContainer: {
        marginVertical: 10,
        paddingHorizontal: SPACING.spacing_16,
    },
    noteInput: {
        height: 50,
        borderColor: COLORS.gray,
        borderWidth: 1,
        borderRadius: BORDERRADIUS.radius_10,
        paddingHorizontal: SPACING.spacing_10,
        fontSize: 20,
        fontFamily: FONTFAMILY.dongle_light,
        color: COLORS.textColor,
    },
    
    
  });
  export default styles;