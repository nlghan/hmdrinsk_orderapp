import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        height: '100%',
    },
    scrollContainer: {
        paddingHorizontal: 8,
       

    },
    backButton: {
        position: 'absolute',
        top: 30,
        left: 30,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 10,
        borderRadius: 50,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 400,
        borderRadius: 12,
        resizeMode: 'stretch',
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        marginVertical: 12,
    },
    descriptionContainer: {
        width: '100%',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'left',
        paddingHorizontal: 10,
        textAlign: 'justify'
    },
    readMore: {
        color: COLORS.primaryGreenHex,
        fontWeight: 'bold',
    },
    sizeContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 10, // 👈 Giữ khoảng cách 30px với phần bottom
    },
    sizeLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sizeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    sizeButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#777',
        paddingVertical: 12,
        borderRadius: 6,
        marginHorizontal: 4,
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        elevation: 5,
        position: 'relative', // 👈 Đổi từ absolute thành relative nếu cần
    },
    
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'green',
    },
    cartButton: {
        backgroundColor: 'green',
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 8,
    },
    cartText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    selectedSize: {
        backgroundColor: COLORS.primaryGreenHex,
        borderColor: COLORS.primaryGreenHex,
    },
    topButtons: {
        position: 'absolute',
        top: 15,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    favoriteButton: {
        position: 'absolute',
        top: 30,
        right: 30,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 10,
        borderRadius: 50,
        elevation: 3,
    },
    reviewContainer: {
        paddingHorizontal: 8,
        paddingBottom: 10
    },

    reviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        
    },

    noReviews: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginVertical: 10,
    },
    reviewItem: {
        flexDirection: 'row',
        paddingHorizontal:20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    reviewContent: {
        flex: 1,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    reviewDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    loadMoreButton: {
        alignSelf: 'center',
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    loadMoreText: {
        color: '#fff',
        fontSize: 14,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
       
        
    },
    
    viewAllReviewsButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    
    viewAllReviewsText: {
        fontSize: 16,
        color: '#007BFF',
        fontWeight: 'bold',
        marginRight: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        marginBottom:6

    },
    ratingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        marginRight: 5,
    },
    reviewCount: {
        fontSize: 14,
        color: '#666',
    },
    
    
});

export default styles;
