import { View, Animated, Text, Image, ActivityIndicator, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCategoryStore } from '../store/store';
import { useTranslation } from 'react-i18next';
import { FONTFAMILY } from '../theme/theme';

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
  const { t } = useTranslation();
  const [post, setPost] = useState<Post | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isVoucherClaimed, setIsVoucherClaimed] = useState(false);
  const { language, userId } = useCategoryStore();

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
    console.log('Claiming voucher:', voucherId, userId, token);
    const payload = {
      userId: parseInt(String(userId), 10),  // Đảm bảo luôn là chuỗi trước khi parse
      voucherId: voucherId,
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
          <Text style={styles.date}>{t('common.dateCreate')}: {post.dateCreated}</Text>
          <Text style={styles.shortDescription}>{post.shortDescription}</Text>
          <Text style={styles.description}>{post.description}</Text>

          {voucher && (
            <View style={styles.voucherSection}>
              <Text style={styles.voucherTitle}>🎉 {t('postContent.infoVoucher')} 🎉</Text>

              {voucher && (
                <View style={styles.voucherCard}>
                  <View style={styles.voucherCard1}>
                    <Image source={require("../assets/app_images/vc-b.png")} style={styles.voucherImage} />
                    <View style={styles.voucherInfo}>
                      <Text style={styles.voucherCode}>{voucher.key}</Text>
                      <Text style={styles.voucherText}>{t('order.discount')}: {voucher.discount}đ</Text>
                      <Text style={styles.voucherText}>{t('quantity')}: {voucher.number}</Text>
                      <Text style={styles.voucherText}>📆 {t('postContent.startDate')}: {voucher.startDate}</Text>
                      <Text style={styles.voucherText}>⌛{t('postContent.endDate')}: {voucher.endDate}</Text>
                    </View>
                  </View>

                  <View>
                    {(() => {
                      const currentDate = new Date();
                      const startDateRaw = new Date(Date.parse(voucher.startDate.replace(" ", "T")));
                      const endDateRaw = new Date(Date.parse(voucher.endDate.replace(" ", "T")));

                      const startDate = new Date(
                        startDateRaw.getUTCFullYear(),
                        startDateRaw.getUTCMonth(),
                        startDateRaw.getUTCDate(),
                        startDateRaw.getUTCHours(),
                        startDateRaw.getUTCMinutes(),
                        startDateRaw.getUTCSeconds()
                      );

                      const endDate = new Date(
                        endDateRaw.getUTCFullYear(),
                        endDateRaw.getUTCMonth(),
                        endDateRaw.getUTCDate(),
                        endDateRaw.getUTCHours(),
                        endDateRaw.getUTCMinutes(),
                        endDateRaw.getUTCSeconds()
                      );

                      if (isVoucherClaimed) {
                        return <Text style={styles.voucherButton}>{t('newsDetail.voucher.status5')}</Text>;
                      } else if (startDate > currentDate) {
                        return <Text style={styles.voucherButton}>{t('newsDetail.voucher.status2')}</Text>;
                      } else if (endDate < currentDate) {
                        return <Text style={styles.voucherButton}>{t('newsDetail.voucher.status3')}</Text>;
                      } else {
                        return (
                          <TouchableOpacity onPress={() => claimVoucher(voucher.voucherId)}>
                            <Text style={styles.voucherButton}>🔗 {t('newsDetail.voucher.status6')}</Text>
                          </TouchableOpacity>
                        );
                      }
                    })()}
                  </View>
                </View>
              )}

            </View>
          )}

          {post.isDeleted && <Text style={styles.deleted}>⚠ Bài viết đã bị xóa</Text>}
        </View>
      ) : (
        <Text>{t('loading')}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  image: { width: '100%', height: 300, resizeMode: 'cover', marginBottom: 10 },
  title: {
    fontSize: 30,
    color: "#ff6600",
    fontFamily: FONTFAMILY.dongle_bold,
    lineHeight: 30,
    textAlign: 'center'
  },
 
  voucherInfo: {
    flex: 1,
  },
  date: { fontSize: 22, color: 'gray', marginBottom: 10, fontFamily: FONTFAMILY.dongle_light, lineHeight: 20 },
  description: { fontSize: 28, marginBottom: 10, fontFamily: FONTFAMILY.dongle_light, lineHeight: 30, marginTop: 10 },
  shortDescription: { fontSize: 26, marginBottom: 10, fontFamily: FONTFAMILY.dongle_regular, lineHeight: 20, color: '#27ae60' },
  voucherContainer: { padding: 10, backgroundColor: '#f2f2f2', borderRadius: 5, marginTop: 10, marginBottom: 10 },
  deleted: { fontSize: 16, color: 'red', marginTop: 10 },
  // Voucher Section
  voucherSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  voucherButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "rgb(114, 170, 164)",
    borderRadius: 8,
    textAlign: "center",
    color:'#fff',
    fontFamily: FONTFAMILY.dongle_regular,
    fontSize:24,
    lineHeight: 22
  },
  voucherTitle: {
    fontSize: 30,
    color: "#ff6600",
    fontFamily: FONTFAMILY.dongle_bold,
    textAlign: 'center'
  },
  voucherCard: {
    backgroundColor: '#f2fffa',
    padding: 13,
    borderRadius: 8,
    marginBottom: 40,
    marginTop:10,
    marginHorizontal: 10, // Giảm khoảng cách hai bên
    width: "100%",  // Giới hạn chiều rộng không quá lớn
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    alignSelf: "center", // Căn giữa card
    display: 'flex',
    flexDirection: 'column',
    overflow: "hidden", // Tránh tràn nội dung
  },
  voucherCard1: {
    alignSelf: "center", // Giúp căn giữa card
    display: 'flex',
    flexDirection: 'row'
  },
  voucherImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 15,
  },

  voucherCode: {
    fontSize: 28,
    fontFamily: FONTFAMILY.dongle_bold,
    color: "#ff4500",
    marginBottom: 5,
    lineHeight:20,
  },
  voucherText: {
    fontSize: 22,
    fontFamily: FONTFAMILY.dongle_regular,
    lineHeight:20,
    color: "#333",
    marginBottom: 3,
    marginRight: 5,
  },
});

export default NewDetails;
