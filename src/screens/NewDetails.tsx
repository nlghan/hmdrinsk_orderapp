import { View, Animated, Text, Image, ActivityIndicator, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/RootStackParamList';

export type NewDetailsRouteProp = RouteProp<RootStackParamList, 'NewDetails'>;

const NewDetails = () => {
  type Post = {
    postId: number;
    title: string;
    url?: string;
    dateCreated: string;
    description: string;
    shortDescription?: string;
    isDeleted?: boolean;
  };

  type Voucher = {
    voucherId: number;
    key: string;
    discount: number;
    number: number;
    startDate: string;
    endDate: string;
    status: string;
    postId?: number;
  };

  const route = useRoute<NewDetailsRouteProp>();
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const language = 'VN';
  const [isVoucherClaimed, setIsVoucherClaimed] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      const token = await AsyncStorage.getItem('access_token');
      try {
        const response = await axiosInstance.get(`/post/view/${postId}?language=${language}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPost(response.data.body);

        const responseVouchers = await axiosInstance.get(`/voucher/view/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const fetchedVouchers: Voucher[] = responseVouchers.data.body.voucherResponseList || [];

        const matchingVoucher = fetchedVouchers.find((v: Voucher) => v.postId === postId);

        setVoucher(matchingVoucher || null);
        if (matchingVoucher) {
          checkUserVoucher(matchingVoucher.voucherId);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [postId]);

  const checkUserVoucher = async (voucherId?: number) => {
    if (!voucherId) return;
    const token = await AsyncStorage.getItem('access_token');
    const userId = await AsyncStorage.getItem('userId');
    
    try {
      const headers = {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      };
      const response = await axiosInstance.get<{ getVoucherResponseList: Voucher[] }>(
        `/user-voucher/view-all/${userId}`,
        { headers }
      );
      const userVouchers = response.data.getVoucherResponseList || [];
      if (userVouchers.some((v) => v.voucherId === voucherId)) {
        setIsVoucherClaimed(true);
      }
    } catch (err) {
      console.error('Error checking user voucher:', err);
    }
  };


  const claimVoucher = async (voucherId: number) => {
    const token = await AsyncStorage.getItem('access_token');
    const userId = await AsyncStorage.getItem('userId');
    console.log('Claiming voucher:', voucherId, userId, token);
    const payload = { 
      userId: parseInt(userId, 10),    // Chuyển userId thành số nguyên
      voucherId: parseInt(voucherId, 10) // Chuyển voucherId thành số nguyên
    };
    console.log('typetype:', typeof payload.userId, typeof payload.voucherId);
    try {
      console.log('Payload gửi đi:', payload);
      const response = await axiosInstance.post(
        `/user-voucher/get-voucher`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('API Response:', response.data);
      setIsVoucherClaimed(true);
    } catch (err) {
      console.error('Lỗi khi nhận voucher:', err);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <ScrollView style={styles.container}>
      {post ? (
        <View>
          {post.url ? <Image source={{ uri: post.url }} style={styles.image} /> : <Text>Hình ảnh không có sẵn</Text>}
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.date}>Ngày tạo: {post.dateCreated}</Text>
          <Text style={styles.description}>{post.shortDescription}</Text>
          <Text style={styles.description}>{post.description}</Text>

          {voucher && (
            <View style={styles.voucherSection}>
              <Text style={styles.voucherTitle}>🎉 Voucher Khuyến Mãi 🎉</Text>

              <FlatList
                data={voucher ? [voucher] : []}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => {
                  const currentDate = new Date();
                  const startDate = new Date(item.startDate.replace(" ", "T")); // Chuyển định dạng
                  const endDate = new Date(item.endDate.replace(" ", "T")); // Chuyển định dạng
              
                  console.log('Ngày hiện tại:', currentDate);
                  console.log('Ngày bắt đầu:', startDate);
                  console.log('Ngày kết thúc:', endDate);
                  return (
                    <View style={styles.voucherCard}>
                      <Text style={styles.voucherCode}>🎟 Mã: {item.key}</Text>
                      <Text style={styles.voucherText}>🔻 Giảm: {item.discount} VNĐ</Text>
                      <Text style={styles.voucherText}>📦 Số lượng: {item.number}</Text>
                      <Text style={styles.voucherText}>📆 Bắt đầu: {item.startDate}</Text>
                      <Text style={styles.voucherText}>⌛ Hết hạn: {item.endDate}</Text>
                      {isVoucherClaimed ? (
                        <Text style={styles.voucherButton}>✅ Đã thu thập Voucher</Text>
                      ) : startDate > currentDate ? (
                        <Text style={styles.voucherButton}>Chưa tới hạn thu thập Voucher</Text>
                      ) : endDate < currentDate ? (
                        <Text style={styles.voucherButton}>Đã qua hạn thu thập Voucher</Text>
                      ) : (
                        <TouchableOpacity onPress={() => claimVoucher(item.voucherId)}>
                          <Text style={styles.voucherButton}>🔗 Nhận Voucher</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
              />
            </View>
          )}

          {post.isDeleted && <Text style={styles.deleted}>⚠ Bài viết đã bị xóa</Text>}
        </View>
      ) : (
        <Text>Đang tải...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  image: { width: '100%', height: 200, resizeMode: 'cover', marginBottom: 10 },
  title: { fontSize: 20, color: "#ff6600", fontWeight: 'bold', marginBottom: 5 },
  date: { fontSize: 14, color: 'gray', marginBottom: 10 },
  description: { fontSize: 16, marginBottom: 10 },
  voucherContainer: { padding: 10, backgroundColor: '#f2f2f2', borderRadius: 5, marginTop: 10, marginBottom: 10 },
  deleted: { fontSize: 16, color: 'red', marginTop: 10 },
  // Voucher Section
  voucherSection: {
    marginTop: 20,
  },
  voucherButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e89f33",
    borderRadius: 8,
    textAlign: "center",
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6600",
    textAlign: "center",
  },
  voucherCard: {
    backgroundColor: "#faedd4",
    padding: 15,
    paddingRight: 20,
    borderRadius: 8,
    marginBottom: 40,
    margin: 5,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff4500",
    marginBottom: 5,
  },
  voucherText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 3,
    marginLeft: 15,
  },
});

export default NewDetails;
