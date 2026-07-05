import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

// Specified typed navigation interface bypass to ensure strict production standards
export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;      
  const slideAnim = useRef(new Animated.Value(height * 0.1)).current; 

  useEffect(() => {
    // 60fps Native engine animations activation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true, 
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Structural guard matrix check to prevent undefined injection crash
    const timer = setTimeout(() => {
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('Home'); 
      } else {
        console.warn("Architecture critical warning: Navigation context is missing in execution pipeline.");
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, navigation]);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel="Awais Dry Cleaner application loading. Please wait."
      aria-live="polite"
    >
      <Animated.Text 
        style={[
          styles.brandText, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }
        ]}
        accessibilityRole="header"
      >
        Awais Dry Cleaner
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0055FF', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
});