import { StyleSheet } from 'react-native';

const reviewStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        gap:60
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    reviewItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 14,
        color: '#444',
        marginVertical: 4,
    },
    reviewDate: {
        fontSize: 12,
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
        fontSize: 16,
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        
    },
    
    
});

export default reviewStyles;
