import { StyleSheet } from 'react-native';
import {
    BORDERRADIUS,
    COLORS,
    FONTFAMILY,
    SPACING,
} from '../theme/theme';
const styles = StyleSheet.create({
    container: { paddingBottom: 20, backgroundColor: '#fff' },
    banner: { height: 200, justifyContent: 'flex-end', padding: 16 },
    backButton: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 24 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    optionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -30, marginBottom: 16, marginHorizontal: 16 },
    optionBox: { backgroundColor: '#fff', borderRadius: 12, padding: 12, width: '45%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3 },
    optionText: { fontSize: 14 },
    noticeBox: { backgroundColor: '#fff', marginHorizontal: 24, padding: 16, borderRadius: 12, elevation: 2 },
    noticeText: { fontWeight: 'bold' },
    noticeSubText: { marginTop: 4, color: '#555' },
    section: { marginTop: 16, paddingHorizontal: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, justifyContent: 'space-between', elevation: 2 },
    detailText: { flex: 1, marginLeft: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
    boldText: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold, color: '#E53935'
    },
    linkText: { color: '#007AFF' },
    statusLabel: { color: 'green', fontWeight: '500', marginBottom: 8 },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    editIcon: {
        width: 30,
        alignItems: 'center',
    },
    itemText: {
        flex: 1,
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
        marginLeft: 15,
    },
    priceContainer: {
        width: 80,
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
        color: 'black',
        textAlign: 'right',
    },
    itemsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10,
    },
    quantity: { fontWeight: 'bold', marginTop: 4 },
    orderDetail: { flex: 1 },
    price: { fontWeight: 'bold', marginLeft: 8, fontSize: 20 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12, marginHorizontal: 16 },
    nextButton: { backgroundColor: '#FF9800', padding: 16, borderRadius: 10, marginHorizontal: 16, alignItems: 'center', marginTop: 12, marginBottom: 20 },
    nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalOption: {
        paddingVertical: 12,
    },
    modalText: {
        fontSize: 16,
        color: '#00B14F',
        textAlign: 'center',
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 8,
    },
    groupInfoBox: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // for Android
    },


});
export default styles;