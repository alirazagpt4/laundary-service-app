import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface SplashScreenProps {
  navigation: {
    replace: () => void;
  };
}

const { height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const theme = useTheme();
  
  // 1% Engineer Edge: High-performance hardware accelerated opacity & translation matrices
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoMoveY = useRef(new Animated.Value(0)).current;
  const loginTextOpacity = useRef(new Animated.Value(0)).current;
  const loginTextMoveY = useRef(new Animated.Value(40)).current; // Start 40px lower

  useEffect(() => {
    // Pipeline Sequence: Fade-in Logo -> Hold 2 Seconds -> Shift Up & Reveal Login text
    Animated.sequence([
      // 1. Smoothly fade in the core brand logo
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // 2. Strict 2-second retention delay matching your hardware requirement
      Animated.delay(2000),
      // 3. Parallel Execution: Shift logo up while fading/sliding login text up from underneath
      Animated.parallel([
        Animated.timing(logoMoveY, {
          toValue: -60, // Push logo up by 60 units
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(loginTextOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(loginTextMoveY, {
          toValue: 0, // Slide up to its original absolute position
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // 4. Structural Handshake: Move directly to App.tsx router gate after animation loop completes
      setTimeout(() => {
        navigation.replace();
      }, 800); // Small breathing space after animation finishes
    });
  }, [logoOpacity, logoMoveY, loginTextOpacity, loginTextMoveY, navigation]);

  return (
    <View 
      style={styles.container} 
      accessible={true} 
      accessibilityRole="summary" 
      accessibilityLabel="Awais Dry Cleaners Core Stream Initialization. System Loading..."
    >
      <View style={styles.centerWrapper}>
        {/* BRAND LOGO TEXT LAYER */}
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              opacity: logoOpacity,
              transform: [{ translateY: logoMoveY }]
            }
          ]}
        >
          <Text style={styles.logoText} accessibilityRole="header">
            CLEAN & FRESH
          </Text>
          <Text style={styles.logoSubText}>LAUNDRY SERVICE</Text>
        </Animated.View>

        {/* DYNAMIC UNDERNEATH LOGIN TEXT GATE */}
        <Animated.View 
          style={[
            styles.loginGateContainer,
            {
              opacity: loginTextOpacity,
              transform: [{ translateY: loginTextMoveY }]
            }
          ]}
        >
          <Text style={styles.loginGateText}>Initializing Secure Control Gate...</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Dark Slate Premium UX Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerWrapper: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6366F1', // Smooth brand signature purple/blue
    letterSpacing: 2,
    textAlign: 'center',
  },
  logoSubText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 6,
  },
  loginGateContainer: {
    position: 'absolute',
    bottom: 0, // Sits strictly underneath the shifted logo
    alignItems: 'center',
  },
  loginGateText: {
    fontSize: 14,
    color: '#10B981', // Operational active green status indicating progress
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});