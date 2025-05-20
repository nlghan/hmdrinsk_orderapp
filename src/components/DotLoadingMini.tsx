import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import {COLORS, FONTFAMILY, FONTSIZE} from '../theme/theme';
import teacupAnimation from '../lottie/dotload.json';

interface DotLoadingMiniProps {
  title: string;
}

const DotLoadingMini: React.FC<DotLoadingMiniProps> = ({title}) => {
  return (
    <View style={styles.EmptyCartContainer}>
      <LottieView
        style={styles.LottieStyle}
        source={teacupAnimation} // Thay vì require
        autoPlay
        loop
      />
      <Text style={styles.LottieText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
     EmptyCartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // để trong suốt
    width: 150,   // kích thước phù hợp
    height: 150,
    borderRadius: 10,
  },
  LottieStyle: {
    width: 100,
    height: 100,
  },
  LottieText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryGreenHex,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DotLoadingMini;
