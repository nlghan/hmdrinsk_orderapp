import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AlertProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    title?: string;
    onConfirm?: () => void;
}

const Alert: React.FC<AlertProps> = ({
    visible,
    message,
    onClose,
    title = 'Thông báo',
    onConfirm,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {onConfirm ? (
                            <>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                    <Text style={styles.cancelText}>Huỷ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                                    <Text style={styles.confirmText}>Xác nhận</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onClose}>
                                <Text style={styles.confirmText}>Đóng</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: '#FFF6EE',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    }
    ,
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E35D11',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: 'rgba(233, 102, 20, 0.87)',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Alert;
