import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next'; // Import hook useTranslation
import { useCategoryStore } from '../store/store'; // Import Zustand store

// Định nghĩa kiểu dữ liệu cho userInfo
interface UserInfo {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  birth_date: string;
  address: string;
  email: string;
  phone: string;
  sex: string;
  role: string;
}

// Định nghĩa kiểu dữ liệu cho props của MemberCard
interface MemberCardProps {
  userInfo: UserInfo | null | undefined; // Chấp nhận cả undefined
}

const MemberCard: React.FC<MemberCardProps> = ({ userInfo }) => {
  if (!userInfo) return null; // Nếu chưa có dữ liệu, không render gì
  const { t } = useTranslation();
  const { data } = useCategoryStore();
  const { userCoin } = data;

  const targetCoin = 100000;
  const progress = userCoin ? userCoin / targetCoin : 0; // ✅ Tính phần trăm tiến trình

  return (
    <LinearGradient colors={['#ffb330', '#fffcce']} style={styles.card}>
      <ImageBackground source={require('../assets/app_images/nen.png')} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.cardHeader}>
          {/* Avatar */}
          <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />

          {/* Thông tin tên */}
          <View>
            <Text style={styles.cardTitle}>{userInfo.fullName}</Text>
            <Text style={styles.cardEmail}>{userInfo.email}</Text>
            <Text style={styles.cardSubTitle}>{t('userContent.customer')}</Text>
          </View>
        </View>

        {/* Thanh tiến trình */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={Math.min((userCoin ?? 0) / targetCoin, 1)}
            color="#ee9717"  // ✅ Màu vàng nổi bật
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {(userCoin ?? 0).toLocaleString()} {t('cart.coinname')} / {targetCoin.toLocaleString()} {t('cart.coinname')}
          </Text>
        </View>




      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginTop: 10,
  },
  backgroundImage: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardEmail: {
    fontSize: 14,
    color: '#eee',
  },
  cardSubTitle: {
    fontSize: 14,
    color: '#000',
  },
  progressContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  progressBar: {
    height: 10,   // ✅ Tăng độ dày thanh progress
    borderRadius: 5,  // ✅ Bo tròn thanh progress
    backgroundColor: '#b5ab9d', // ✅ Màu nền thanh chưa đầy
  },
  progressText: {
    fontSize: 12,
    color: '#000',  // ✅ Đổi màu chữ để dễ đọc
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

export default MemberCard;
