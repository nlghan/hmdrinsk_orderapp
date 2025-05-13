import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    visible: boolean;
    initialName: string;
    onCancel: () => void;
    onSave: (newName: string) => void;
}

const EditGroupNameModal: React.FC<Props> = ({ visible, initialName, onCancel, onSave }) => {
    const [newName, setNewName] = useState(initialName);

    useEffect(() => {
        setNewName(initialName);
    }, [initialName]);

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Đổi tên nhóm</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Nhập tên nhóm mới"
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={onCancel} style={[styles.modalButton, styles.cancelButton]}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onSave(newName)} style={[styles.modalButton, styles.saveButton]}>
                            <Text style={styles.saveText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default EditGroupNameModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF8F2',
        padding: 24,
        borderRadius: 20,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FF7F3F',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1.5,
        borderColor: '#FFB482',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#FFF1E8',
        color: '#333',
        fontSize: 16,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    cancelButton: {
        backgroundColor: '#FFE1D0',
    },
    saveButton: {
        backgroundColor: '#FF8C42',
    },
    cancelText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 15,
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    
});
