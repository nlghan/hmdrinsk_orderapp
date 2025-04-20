import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import {COLORS, FONTFAMILY, FONTSIZE} from '../theme/theme';
import teacupAnimation from '../lottie/teaload.json';

interface LoadingProps {
  title: string;
}

const Loading: React.FC<LoadingProps> = ({title}) => {
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
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'hsla(0, 0.00%, 48.60%, 0.00)', // Tối hơn để animation nổi bật
      },
      
  LottieStyle: {
    marginTop:'50%',
    height: 200,
    zIndex:1000
  },
  LottieText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryGreenHex,
    textAlign: 'center',
    marginBottom:150
  },
});

export default Loading;
