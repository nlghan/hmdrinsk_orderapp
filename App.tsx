import React, {useState} from 'react';
import {SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, View} from 'react-native';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Hàm xử lý đăng nhập
  const handleLogin = async () => {
    // Kiểm tra nếu username hoặc password rỗng
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    // Cấu hình body cho yêu cầu POST
    const requestBody = JSON.stringify({
      userName: username,
      password: password,
    });

    try {
      // Gọi API đăng nhập
      const response = await fetch('http://192.168.1.18:1010/api/v1/auth/authenticate', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      // Kiểm tra xem API có trả về kết quả thành công hay không
      const responseData = await response.json();
      
      if (response.ok) {
        // Nếu đăng nhập thành công
        Alert.alert('Success', 'Logged in successfully');
        console.log('Login success:', responseData); // Xử lý dữ liệu trả về từ API nếu cần
      } else {
        // Nếu có lỗi trong quá trình đăng nhập
        Alert.alert('Error', responseData.message || 'Login failed');
      }
    } catch (error) {
      // Nếu có lỗi trong quá trình gọi API
      Alert.alert('Error', 'An error occurred while logging in');
      console.error('Login error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Login</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Ô nhập username */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        
        {/* Ô nhập password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        
        {/* Nút đăng nhập */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 12,
  },
  button: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;
