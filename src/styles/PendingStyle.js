import { StyleSheet } from 'react-native';
import { FONTFAMILY } from '../theme/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
    },
    flatlistContainer: {
        backgroundColor: '#FFFFFF',
        padding: 5,
        marginHorizontal: 8,
        borderRadius: 10,
        marginTop: 10,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    backIcon: {
        position: "absolute",
        top: 15,
        left: 10,
    },
    header: {
        fontSize: 24,
        fontFamily: FONTFAMILY.lobster_regular,
        textAlign: 'center',
    },
    body: {
        flex: 1,
    },
    card: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    orderId: {
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
        marginBottom: 8,
    },
    boldText: {
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: FONTFAMILY.dongle_regular,
        color: '#333',
        marginBottom: 4,
    },
    size: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_regular,
        color: 'gray',
    },
    price: {
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_regular,
        color: '#27ae60',
        marginTop: 4,
    },
    totalPrice: {
        fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 28,
        color: '#e74c3c',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-around', // Đưa nút về lề phải
        alignItems: 'center', // Căn giữa theo chiều dọc,
        gap: 5
    },
    button: {
        backgroundColor: '#ff6347',
        padding: 8,
        borderRadius: 5,
        width: 100
    },
    buttonText: {
        color: 'white',
        fontSize: 22,
        fontFamily: FONTFAMILY.dongle_bold,
        textAlign: 'center'
    },
    boldText1: {
        fontFamily: FONTFAMILY.dongle_regular,
        fontSize: 24
    },
    boldText2: {
        fontFamily: FONTFAMILY.dongle_light,
        fontSize: 24
    },
    separator: {
        borderTopWidth: 1,
        borderColor: '#ccc',
        marginVertical: 10,
        paddingVertical: 5,
        alignItems: 'center',
    },
    separatorText: {
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_bold,
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
        gap: 10,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        width:150
    },
    activeTab: {
        backgroundColor: '#FF9800',
    },
    tabText: {
        fontSize: 14,
        color: '#333',
        textAlign:'center'
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    bold: {
        fontWeight: '600',
        color: '#000',
    },


}
)

export default styles;
