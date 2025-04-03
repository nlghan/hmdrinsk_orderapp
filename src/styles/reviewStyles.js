import { StyleSheet } from 'react-native';
import { FONTFAMILY } from '../theme/theme';

const reviewStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        gap: 40
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily:FONTFAMILY.lobster_regular
        
    },
    reviewItem: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10, // 👈 Đảm bảo có khoảng cách với phần dưới
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    
    userName: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_regular,
        color: '#333',
        marginVertical: 4,
    },
    reviewDate: {
        fontSize: 20,
        fontFamily: FONTFAMILY.dongle_light,
        color: '#888',
    },
    loadMoreButton: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    loadMoreText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    addReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        position: 'absolute',
        right: 10,
        borderWidth: 1, // 👈 Thêm viền
        borderColor: '#ccc', // 👈 Màu viền (có thể chỉnh sửa theo ý muốn)
    },

    addReviewText: {
        color: '#FFF',
        fontSize: 16,
        marginLeft: 5,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
        marginTop: 10,
        paddingHorizontal: 8,
        paddingHorizontal: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginTop: 5,
        marginHorizontal: 8,
    },
    submitButton: {
        backgroundColor: '#FF7F24', // Nút cam đậm
        shadowColor: '#FF6347',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 8,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: FONTFAMILY.dongle_regular,
        fontWeight: 'bold',

    },
    nestedContainer: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginHorizontal: 8,
       height:'90%'
    },
    editText: {
        fontSize: 18,
        color: '#FF8247',
        marginTop: 5,
        textAlign: 'center',
    },
    reviewItem1:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between'
    },
    reviewItem2:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center',
        gap:15
    },
    actions: {
        position: 'absolute',
        top: 30, // Điều chỉnh khoảng cách từ dấu ba chấm
        right: 15,
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
        width: 120, // Có thể thay đổi để vừa với các nút
    },
    actionText: {
        fontSize: 14,
        color: 'white',
        paddingVertical: 5,
        textAlign: 'center',
    },
    
   
});

export default reviewStyles;
