// components/network-status.tsx
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      
      // Show offline indicator when disconnected
      if (!connected) {
        setIsVisible(true);
      } else {
        // Hide after 3 seconds when back online
        setTimeout(() => setIsVisible(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!isVisible) return null;

  return (
    <View style={[
      styles.container,
      { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
    ]}>
      <Ionicons 
        name={isConnected ? 'wifi' : 'wifi'} 
        size={16} 
        color="white" 
      />
      <Text style={styles.text}>
        {isConnected ? 'Đã kết nối' : 'Không có kết nối - Chế độ offline'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});
