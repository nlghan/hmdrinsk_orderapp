import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const GroupOrderButton = ({ onPress }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const animatedTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
      <View style={styles.gradientBorder}>
        {/* Animated Gradient Border */}
        <Animated.View
          style={[
            styles.animatedGradient,
            {
              transform: [{ translateX: animatedTranslate }],
              opacity: 0.8,
            },
          ]}
        >
          <LinearGradient
            colors={['#FFA500', '#FF4500', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>

        {/* Inner White Button */}
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <View style={styles.innerButton}>
            <View style={styles.content}>
              <Icon name="group-add" size={22} color="black" style={{ marginRight: 8 }} />
              <Text style={styles.text}>{t('android.groupOrder')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GroupOrderButton;
const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 10,
    },
    gradientBorder: {
      padding: 2, // Tăng viền
      borderRadius: 32,
      overflow: 'hidden',
      shadowColor: '#FFA500',
      shadowOpacity: 0.5,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    animatedGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    gradient: {
      width: 500,
      height: '100%',
    },
    innerButton: {
      backgroundColor: 'white',
      borderRadius: 30,
      paddingVertical: 10,
      paddingHorizontal: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'black',
    },
  });
  