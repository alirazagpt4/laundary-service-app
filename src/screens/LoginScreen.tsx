// src/screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, View, ActivityIndicator, Alert, SafeAreaView, Animated 
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper'; // React Native Paper Core components
import { useApp } from '../context/AppContext';
import { apiService } from '../api/apiService'; 
import { globalStyles } from '../theme/styles';

export default function LoginScreen() {
  const { loginState } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Dynamic eye-toggle tracking state

  // Animation Matrix Drivers
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(40)).current; 
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Logo smooth fade-in and subtle lift
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // 2. Strict delay execution phase
      Animated.delay(250),
      // 3. Smooth Orchestrated Transition: Push logo up, reveal input form underneath
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -50, 
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0, 
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleNetworkLogin = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      Alert.alert("Input Validation Error", "Both email and password fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post('/auth/login', {
        email: cleanEmail,
        password: password
      });

      const { success, data, message } = response.data;
      if (success && data) {
        await loginState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user
        });
      } else {
        Alert.alert("Authentication Failed", message || "Server emitted rejection loop.");
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "Network execution pipeline timeout.";
      Alert.alert("Authentication Failed", serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.mainContainer}>
      <View style={styles.centerEngine} accessible={true} accessibilityLabel="Security Access Layer">
        
        {/* ANIMATED BRAND LOGO SECTION */}
        <Animated.View 
          style={[
            styles.logoWrapper, 
            { 
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }]
            }
          ]}
        >
          <Text style={styles.title} accessibilityRole="header">Awais</Text>
          <Text style={styles.subTitle}>DRY CLEANERS</Text>
        </Animated.View>

        {/* FADE-IN & SLIDE INPUTS UNDERNEATH */}
        <Animated.View 
          style={[
            styles.formWrapper,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }]
            }
          ]}
        >
          {/* EMAIL FORM INPUT CONTAINER */}
          <View style={styles.inputBoxWrapper}>
            <TextInput
              mode="outlined"
              label="Email Address"
              placeholder="Enter Email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              outlineColor="#E2E8F0"
              activeOutlineColor="#6366F1"
              style={styles.paperInput}
              contentStyle={styles.inputContent}
              disabled={loading}
              accessibilityLabel="Input field for email address"
            />
          </View>

          {/* PASSWORD FORM INPUT CONTAINER */}
          <View style={styles.inputBoxWrapper}>
            <TextInput
              mode="outlined"
              label="Password"
              placeholder="Enter Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              outlineColor="#E2E8F0"
              activeOutlineColor="#6366F1"
              style={styles.paperInput}
              contentStyle={styles.inputContent}
              disabled={loading}
              accessibilityLabel="Input field for account password"
              right={
                <TextInput.Icon 
                  icon={isPasswordVisible ? "eye-off" : "eye"} 
                  iconColor="#64748B"
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  accessibilityLabel="Toggle password visibility visibility strip"
                />
              }
            />
          </View>

          {/* SUBMIT BUTTON CONTROL INTERFACE */}
          <Button
            mode="contained"
            onPress={handleNetworkLogin}
            disabled={loading}
            style={[styles.submitButton, loading && styles.btnDisabled]}
            contentStyle={styles.submitButtonContent}
            loading={loading}
            accessibilityRole="button"
            accessibilityLabel="Perform account login process validation"
          >
            {!loading && <Text style={styles.submitButtonText}>Login</Text>}
          </Button>

        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerEngine: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16, // Expanded slightly for balanced design proportions
  },
  logoWrapper: {
    alignItems: 'center',
    zIndex: 10,
  },
  title: { 
    fontSize: 34, 
    fontWeight: '900', 
    color: '#6366F1', 
    textAlign: 'center', 
    letterSpacing: 1.5 
  },
  subTitle: { 
    fontSize: 12, 
    color: '#64748B', 
    textAlign: 'center', 
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  formWrapper: {
    width: '100%',
    marginTop: -20, 
  },
  inputBoxWrapper: {
    marginBottom: 16,
  },
  paperInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  inputContent: {
    fontWeight: '600',
    color: '#0F172A',
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    elevation: 2,
  },
  submitButtonContent: {
    height: 50,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnDisabled: { 
    backgroundColor: '#CBD5E1', 
    elevation: 0,
  }
});