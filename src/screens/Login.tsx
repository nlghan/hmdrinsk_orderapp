import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import axiosInstance from '../utils/axiosInstance'; // Import axiosInstance

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const Login: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/v1/auth/authenticate', {
        userName: username,
        password: password,
      });

      setLoading(false);

      if (response.status === 200) {
        Alert.alert('Thành công', 'Đăng nhập thành công!');
        navigation.navigate('Home'); // Chuyển đến trang Home
      } else {
        Alert.alert('Lỗi', response.data.message || 'Sai tài khoản hoặc mật khẩu');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể kết nối đến máy chủ');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        placeholderTextColor="#FFA07A"
        value={username}
        onChangeText={setUsername}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#FFA07A"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Đăng nhập</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF0', // Màu nền trắng nhạt
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4500', // Màu cam đậm
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF5EE', // Màu trắng nhạt
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#FF4500', // Màu chữ cam
    borderWidth: 1,
    borderColor: '#FFA07A',
  },
  loginButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#FF4500', // Màu cam đậm
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Login;
