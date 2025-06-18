import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type JoinGroupInputProps = {
    onCheckCode: (code: string) => void;
};

const JoinGroupInput: React.FC<JoinGroupInputProps> = ({ onCheckCode }) => {
    const [code, setCode] = useState('');

    const handleCheck = () => {
        if (!code.trim()) return;
        onCheckCode(code.trim());
        Keyboard.dismiss(); // Ẩn bàn phím
    };

    const handleClear = () => {
        setCode('');
    };

    return (
        <View style={styles.joinContainer}>
    
            <TextInput
                style={styles.input}
                placeholder="Nhập mã nhóm"
                value={code}
                onChangeText={setCode}
                placeholderTextColor="#999"
                returnKeyType="done"
                onSubmitEditing={handleCheck}
            />
            {code.trim() !== '' && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleClear}
                >
                    <Icon name="close" size={22} color="#888" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    joinContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        paddingLeft: 16,
        paddingRight: 40, // chừa chỗ cho icon
        fontSize: 16,
        color: '#333',
    },
    iconButton: {
        position: 'absolute',
        right: 10,
        padding: 6,
    },
     iconButton1: {
        position: 'absolute',
        left: 10,
        padding: 6,
    },
});

export default JoinGroupInput;
