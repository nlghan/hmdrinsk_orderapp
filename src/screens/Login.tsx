import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from '../store/store';  // Import store
import { Buffer } from 'buffer';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const getUserIdFromToken = (token: string) => {
  try {
    const payload = token.split('.')[1];  
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));

    console.log('Decoded Payload:', decodedPayload); // Kiểm tra nội dung payload
    return parseInt(decodedPayload.UserId, 10);
  } catch (error) {
    console.error('Cannot decode token:', error);
    return null;
  }
};

const Login: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUserId = useCategoryStore((state) => state.setUserId);  // Lấy setUserId từ Zustand
  

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
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Lưu token vào AsyncStorage
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // Lấy userId từ token và lưu vào Zustand
        const userId = getUserIdFromToken(accessToken);
        console.log('User ID:', userId);
        setUserId(userId);

        Alert.alert('Thành công', 'Đăng nhập thành công!');
        navigation.replace('Main');  
      } else {
        Alert.alert('Lỗi', response.data.message || 'Sai tài khoản hoặc mật khẩu');
      }
    } catch (error: any) {
      setLoading(false);
      console.log('Login Error:', error.response?.data || error);
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
    backgroundColor: '#FFFAF0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4500',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF5EE',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#FF4500',
    borderWidth: 1,
    borderColor: '#FFA07A',
  },
  loginButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#FF4500',
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
