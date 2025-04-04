import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTFAMILY } from '../theme/theme';

const { height, width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFDCC0', // Màu nền chính
        position: 'relative',
    },
    imageContainer: {
        position: 'absolute',
        top: height * 0.1, 
        left: width * 0.51 - (height * 0.25), // Căn giữa hình
        zIndex: 100, // Đảm bảo ảnh nằm trên nội dung
        alignItems: 'center',
        width: '100%',
    },
    image: {
        width: height * 0.35,
        height: height * 0.35,
        borderRadius: height * 0.05, // Ảnh tròn
        borderWidth: 5,
        borderColor: '#fff',
    },
    infoContainer: {
        flex: 1,
        backgroundColor: '#fff',
        width: width,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
        paddingTop: height * 0.3,
        marginTop: height * 0.26, // Điều chỉnh để ảnh không bị cắt
        zIndex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: height * 0.1, // Tăng khoảng cách để tránh bị che khuất
        backgroundColor: '#FFDCC0',
    },
    title: {
        fontSize: 40,
        fontFamily:FONTFAMILY.dongle_bold,
        color: '#333',
        textAlign: 'center',
        marginBottom:-10
    },
    description: {
        fontSize: 26,
        fontFamily:FONTFAMILY.dongle_light,
        color: '#666',
        textAlign: 'justify',
        paddingHorizontal: 10,
        marginTop:-15
    },
    readMore: {
        fontSize: 18,
        color: COLORS.primaryGreenHex,
        fontFamily:FONTFAMILY.dongle_regular,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#444',
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    distanceText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        justifyContent: 'center',
    },
    discountedPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#27AE60',
    },
    originalPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
        color: '#888',
        marginLeft: 10,
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: '#27AE60',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        
    },
    ratingText: {
        fontSize: 30,
        fontFamily:FONTFAMILY.dongle_bold,
        marginLeft: 4,
        color: '#555',
    },
    reviewCount: {
        fontSize: 26,
        fontFamily:FONTFAMILY.dongle_regular,
        color: '#888',
        marginLeft: 6,
    },
    sizeContainer: {
        width: '100%',
        marginTop: 10,
        paddingBottom: 30, // Tăng padding để tránh bị che khuất
    },
    sizeLabel: {
        fontSize: 32,
        fontFamily:FONTFAMILY.dongle_bold,
        color: '#333',
        marginBottom: 8,
    },
    sizeOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    
    sizeButton: {
        width: '30%', // Chia đều thành 3 cột
        borderWidth: 1.5,
        borderColor: '#777',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
        height:45
    },
    
    selectedSize: {
        backgroundColor: '#FFDCC0',
        borderColor: COLORS.primaryGreenHex,
    },
    favoriteButton: {
        position: 'absolute',
        top: 20,
        right: 10,
    },
    topButtons: {
        position: 'absolute',
        top: 15,
        left: 1,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 10,
        zIndex: 10,
        backgroundColor: 'rgb(255, 255, 255)',
        padding: 10,
        borderRadius: 50,
        elevation: 3,
    },

    fixedPriceContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingVertical: 20,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ddd',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0d9b5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8B5E3C',
    },
    quantityValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
    },
    cartButton: {
        backgroundColor: '#D87D2A',
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 20,
        width:200,
        height:45
    },
    cartText: {
        fontSize:32,
        fontFamily:FONTFAMILY.dongle_bold,
        color: 'white',
        textAlign:'center'
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'green',
    },
    thumbnailContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    thumbnailWrapper: {
        borderWidth: 2,
        borderColor: 'transparent',
        marginHorizontal: 5,
        padding: 2,
        borderRadius: 10, // Bo tròn khung chứa ảnh
        overflow: 'hidden', // Đảm bảo ảnh không bị tràn ra ngoài
    },
   
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 10, // Bo tròn ảnh nhỏ theo tỷ lệ
        resizeMode: 'cover',
    },
    selectedThumbnail: {
        borderColor: '#FF6347', // Đổi màu viền khi được chọn
    },
    

});
