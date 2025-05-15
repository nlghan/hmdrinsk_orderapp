import { StyleSheet } from 'react-native';
import { FONTFAMILY } from '../theme/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    radioInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
    },
    label: {
        fontSize: 16,
        color: '#333',
    },
    logo: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 14,
    },
    confirmButton: {
        backgroundColor: '#FF9800', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20, width: '100%'
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ddd',
    }
});

export default styles;
