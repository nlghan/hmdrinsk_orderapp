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
        backgroundColor: 'white', // pastel nhẹ nhàng
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        elevation: 2,
        zIndex: 10,
    },
    side: {
        width: 40,
        alignItems: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 28,
        fontFamily: FONTFAMILY.lobster_regular,
        marginLeft: 12,
        textAlign: 'center'
    },
    scrollContent: {
        paddingBottom: 24,
    },
    banner: {
        height: 280,
        justifyContent: 'flex-end',
    },
    card: {
        position: 'absolute',
        top: '70%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 32,
        elevation: 5,
    },
    discountTitle: {
        fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 25,
        lineHeight: 24,
        marginBottom: 6,
    },
    discountSubtitle: {
        fontFamily: FONTFAMILY.dongle_light,
        fontSize: 22,
        lineHeight: 24,
        color: '#666',
        marginBottom: 12,
    },
    discountSteps: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
    },
    circle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FF9800',
        marginBottom: 4,
    },
    stepPercent: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    stepPeople: {
        fontSize: 12,
        color: '#666',
    },
    infoBlock: {
        marginTop: '35%',
        paddingHorizontal: 32,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoIcon: {
        backgroundColor: '#fffce8c7',
        borderRadius: 24,
        padding: 8,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoSubTitle: {
        flex: 1,
    },
    infoEditIcon: {
        paddingLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    label: {
        fontSize: 28,
        fontFamily: FONTFAMILY.dongle_bold,
    },
    value: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_light,
    },
    inviteButton: {
        marginTop: 24,
        marginHorizontal: 32,
        backgroundColor: '#FF9800',
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
    },
    inviteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
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
    backButton: {
        position: 'absolute',
        top: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        position: 'absolute',
        left: 5,
        zIndex: 10,
        padding: 10,
        borderRadius: 50,
        elevation: 3,
    },


});
export default styles;