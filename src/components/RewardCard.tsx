import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTFAMILY } from '../theme/theme';
import { scale, verticalScale, moderateScale, moderateVerticalScale } from 'react-native-size-matters';

interface RewardCardProps {
  icon: string;   // Tên icon từ MaterialCommunityIcons
  title: string;  // Tiêu đề thẻ (text)
  points: number; // Số điểm (dạng số)
  onPress?: () => void; // Hàm xử lý khi nhấn vào thẻ
}

const RewardCard: React.FC<RewardCardProps> = ({ icon, title, points, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Icon name={icon} size={20} color={COLORS.primaryGreenHex} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.points}>{points}</Text>
      <Icon name="chevron-right" size={20} color={COLORS.primaryGreenHex} style={styles.arrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    marginVertical: 5,
    minWidth: 150,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: scale(20),
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#7B614F',
    textTransform: 'uppercase',
  },
  points: {
    fontSize: 24,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#000',
    marginTop: 5,
  },
  arrow: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: scale(2),
    top: scale(13),
  },
});

export default RewardCard;
