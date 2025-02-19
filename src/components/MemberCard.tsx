import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ProgressBar } from 'react-native-paper';

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
  userInfo: UserInfo | null; // Có thể null khi dữ liệu chưa load xong
}

const MemberCard: React.FC<MemberCardProps> = ({ userInfo }) => {
  if (!userInfo) return null; // Nếu chưa có dữ liệu, không render gì

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
            <Text style={styles.cardSubTitle}>THÀNH VIÊN</Text>
          </View>
        </View>

        {/* Thanh tiến trình */}
        <View style={styles.progressContainer}>
          <ProgressBar progress={0} color="#ffffff" style={styles.progressBar} />
          <Text style={styles.progressText}>0 đ / 700,000 coins</Text>
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
    marginTop:10
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
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#444',
  },
  progressText: {
    fontSize: 12,
    color: 'black',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default MemberCard;
