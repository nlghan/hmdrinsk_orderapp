import { StyleSheet } from 'react-native';
import { FONTFAMILY } from '../theme/theme';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 16, paddingBottom: 100 },

    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backIcon: {
        position: 'absolute',
        left: 5,
        padding: 8,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: FONTFAMILY.lobster_regular,
        color: '#333',
    },

    sectionContainer: {
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },

    sectionTitleBig: {
        fontSize: 20,
        fontFamily: FONTFAMILY.lobster_regular,
        marginBottom: 8,
    },

    itemBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    name: { fontSize: 16, fontWeight: 'bold' },
    detail: { fontSize: 14, color: '#555' },
    price: { marginTop: 6, fontSize: 14, fontWeight: '600', color: '#000' },

    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    sectionTitle: { fontSize: 15, color: '#333' },
    sectionValue: { fontSize: 15, fontWeight: '500' },

    discountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    discountText: { color: '#444', fontSize: 14 },
    discountValue: { color: '#2E7D32', fontSize: 14 },

    totalSection: {
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingTop: 12,
    },
    totalLabel: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
    totalAmount: { fontSize: 22, fontWeight: 'bold', color: '#E53935', marginTop: 4 },

    savedText: {
        marginTop: 12,
        fontSize: 14,
        textAlign: 'center',
        color: '#388E3C',
        fontStyle: 'italic',
    },

    button: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 8,
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    nextButton: {
        backgroundColor: '#FF9800', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: '5%', width: '100%', marginTop:'4%'
    },
    nextText: {
        fontSize: 28,
        fontFamily: FONTFAMILY.dongle_bold,
        color: '#fff',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    modalMessage: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: '#FF9800',
    },
    modalButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    detailRows: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, gap: 10, padding:10},
});
export default styles;
