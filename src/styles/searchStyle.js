import { StyleSheet } from 'react-native';
import {
    BORDERRADIUS,
    COLORS,
    FONTFAMILY,
    SPACING,
} from '../theme/theme';
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", // Căn chỉnh các phần tử trong header: nút back bên trái, tiêu đề ở giữa
        marginBottom: 20,
        paddingHorizontal: 10, // Thêm khoảng cách giữa các phần tử và cạnh của màn hình
    },
    headerTitle: {
        fontSize: 24,
        textAlign: 'center',
        fontFamily: FONTFAMILY.lobster_regular,
        flex: 1, // Đảm bảo title chiếm hết không gian còn lại
        textAlign: "center", // Căn giữa tiêu đề
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f1f1",
        padding: 8,
        borderRadius: 20,
    },
    searchInput: {
        marginLeft: 10,
        flex: 1,
        fontSize: 16,
    },
    suggestHeader: {
        fontSize: 20,
        fontFamily:FONTFAMILY.lobster_regular,
        marginVertical: 10,
    },
    // Style cho mỗi cột
    postWrapper: {
        width: "48%", // Mỗi cột chiếm 48% chiều rộng
        marginBottom: 10, // Khoảng cách giữa các sản phẩm
    },
    leftColumn: {
        alignSelf: "flex-start", // Cột trái
    },
    rightColumn: {
        alignSelf: "flex-end", // Cột phải
    },
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 10,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        
    },
    productImage: {
        width: "100%",
        height: 140,
        borderRadius: 10,
        resizeMode: "cover",
        marginBottom: 10, // Khoảng cách giữa hình ảnh và tên sản phẩm
    },
    cardTitle: {
        fontSize: 26,
        fontFamily:FONTFAMILY.dongle_bold,
        color: "#333",
        textAlign: "center",
    },
    cardContainerHover: {
        transform: [{ scale: 1.05 }],
    },
    noResult: {
        fontSize: 16,
        color: "#ff0000",
        textAlign: "center",
        borderStartColor:'red'
    },
    item: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 15,
        marginHorizontal: 8,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        height: 210
    },

    // Có thể bổ sung thêm style cho hover

});
export default styles;