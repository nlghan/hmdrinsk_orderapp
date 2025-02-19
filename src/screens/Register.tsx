import React, { useState, useEffect, useRef } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import axiosInstance from '../utils/axiosInstance';
import registerStyles from '../styles/registerStyles';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register: React.FC<Props> = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        if (!fullName || !username || !password || !email) {
            setErrorMessage('Vui lòng nhập đầy đủ thông tin đăng ký');
            setLoading(false);
            return;
        }

        const data = {
            fullName,
            userName: username,
            password,
            email,
        };

        try {
            const response = await axiosInstance.post('/v1/auth/register', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201 || response.status === 200) {
                setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
                navigation.navigate('Login');
            } else {
                setErrorMessage(response.data.message || 'Đăng ký không thành công');
            }
        } catch (error) {
            setErrorMessage((error as any).response?.data?.message || 'Không thể kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginGG = async () => {
        try {
            const response = await axiosInstance.get('/v1/auth/social-login/google', {
                headers: { 'accept': '*/*' },
            });
            if (response.data) {
                const loginUrl = response.data;
                if (await InAppBrowser.isAvailable()) {
                    const result = await InAppBrowser.open(loginUrl, {
                        dismissButtonStyle: 'close',
                        preferredBarTintColor: '#FFFFFF',
                        preferredControlTintColor: '#000000',
                        showTitle: true,
                        enableUrlBarHiding: true,
                        enableDefaultShare: false,
                    });
                    if (result.type !== 'cancel' && result.type !== 'dismiss') {
                        console.log('Google Login thành công:', result);
                        navigation.navigate('Home'); // Điều hướng sau khi đăng nhập
                    }
                } else {
                    console.error('InAppBrowser không khả dụng');
                }
            } else {
                console.error('Không nhận được URL đăng nhập từ API');
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu Google login:', error);
        }
    };

    useEffect(() => {
        const handleDeepLink = (event: any) => {
            const { url } = event;
            if (url) {
                console.log('Deep link nhận được:', url);
                const token = extractTokenFromUrl(url);
                if (token) {
                    console.log('Access Token:', token);
                    navigation.navigate('Home'); // Điều hướng sau khi login
                }
            }
        };

        // Thêm listener
        const linkingListener = Linking.addEventListener('url', handleDeepLink);

        return () => {
            // Gỡ listener khi unmount
            linkingListener.remove();
        };
    }, []);

    const extractTokenFromUrl = (url: any) => {
        const match = url.match(/access_token=([^&]*)/);
        return match ? match[1] : null;
    };

        const colorAnimation = useRef(new Animated.Value(0)).current;
    
        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(colorAnimation, {
                        toValue: 1,
                        duration: 3000,
                        easing: Easing.linear,
                        useNativeDriver: false, // Vì animate màu sắc không dùng native driver được
                    }),
                    Animated.timing(colorAnimation, {
                        toValue: 0,
                        duration: 3000,
                        easing: Easing.linear,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }, []);
    
        // Tạo màu sắc loang
        const textColor = colorAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#FF4500', '#FFA07A'], // Chuyển từ cam đậm sang cam nhạt
        });
    
        const shadowColor = colorAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#FF7F50', '#FF4500'], // Tạo hiệu ứng bóng chuyển động
        });
    
        const floatingAnimation = useRef(new Animated.Value(0)).current;
    
        useEffect(() => {
            Animated.loop(
                Animated.timing(floatingAnimation, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }, []);
    
        const floatingInterpolate = floatingAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
        });

    return (
        <View style={registerStyles.container}>
            <Animated.Text style={[registerStyles.animatedTitle, { color: textColor, textShadowColor: shadowColor }]}>
                HMDRINKS
            </Animated.Text>
            <Text style={registerStyles.title}>Đăng ký</Text>

            {successMessage ? <Text style={registerStyles.successText}>{successMessage}</Text> : null}
            {errorMessage ? <Text style={registerStyles.errorText}>{errorMessage}</Text> : null}

            <TextInput
                style={registerStyles.input}
                placeholder="Họ và tên"
                placeholderTextColor="#FFA07A"
                value={fullName}
                onChangeText={setFullName}
            />

            <TextInput
                style={registerStyles.input}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#FFA07A"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={registerStyles.input}
                placeholder="Email"
                placeholderTextColor="#FFA07A"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={registerStyles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#FFA07A"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={registerStyles.registerButton} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={registerStyles.registerText}>Đăng ký</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={registerStyles.googleButton} onPress={handleLoginGG}>
                <Image
                    source={require('../assets/img/logoGG.png')} // Cập nhật đường dẫn đến icon của bạn
                    style={registerStyles.googleIcon}
                />
                <Text style={registerStyles.googleText}>Đăng ký bằng Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={registerStyles.loginText1}>
                    Đã có tài khoản? <Text style={registerStyles.loginLink}>Đăng nhập</Text>
                </Text>
            </TouchableOpacity>
            {/* Họa tiết động */}
            <Animated.View
                style={[
                    registerStyles.floatingCircle,
                    { transform: [{ rotate: floatingInterpolate }] },
                ]}
            />
            {/* Họa tiết động */}
            <Animated.View
                style={[
                    registerStyles.floatingCircle1,
                    { transform: [{ rotate: floatingInterpolate }] },
                ]}
            />
            {/* Họa tiết động */}
            <Animated.View
                style={[
                    registerStyles.floatingCircle2,
                    { transform: [{ rotate: floatingInterpolate }] },
                ]}
            />

        </View>
    );
};

export default Register;
