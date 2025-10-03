import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        {/* Replace with your logo image if available */}
        <Image
          source={require('@/assets/images/logo.jpg')} // Update path if needed
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.co2Text}>CO₂</Text>
        <Text style={styles.title}>VietCarbona</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.getStarted}>Let's get started</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8FF8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  co2Text: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: -30,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  getStarted: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 18,
    color: '#222',
  },
  loginButton: {
    backgroundColor: '#D6FFB7',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  signupButton: {
    backgroundColor: '#A8FF8A',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
});