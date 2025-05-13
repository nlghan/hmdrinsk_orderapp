import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface DiscountStepItemProps {
  percent: string;
  people: string;
  active: boolean;
}

const DiscountStepItem: React.FC<DiscountStepItemProps> = ({ percent, people, active }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [active]);

  const AnimatedView = active ? Animated.View : View;

  return (
    <AnimatedView style={[styles.stepContainer, active && { opacity: fadeAnim }]}>
      <Text style={[styles.percentText, active && styles.activeText]}>{percent}</Text>
      <Text style={styles.peopleText}>{people}</Text>
    </AnimatedView>
  );
};

export default DiscountStepItem;

const styles = StyleSheet.create({
  stepContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  } as ViewStyle,
  percentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  } as TextStyle,
  peopleText: {
    fontSize: 12,
    color: '#777',
  } as TextStyle,
  activeText: {
    color: '#FF6D00',
  } as TextStyle,
});
