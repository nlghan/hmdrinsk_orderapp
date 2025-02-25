import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        height: '100%',
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Giúp tránh bị che bởi phần giá
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
    },
    readMore: {
        color: COLORS.primaryGreenHex,
        fontWeight: 'bold',
    },
    sizeContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 20, // 👈 Giữ khoảng cách 30px với phần bottom
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
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
});

export default styles;
