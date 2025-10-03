import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

export interface FlashMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface FlashMessageProps {
  message: FlashMessage;
  onHide: (id: string) => void;
}

const { width } = Dimensions.get('window');

export function FlashMessageComponent({ message, onHide }: FlashMessageProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    const timer = setTimeout(() => {
      hideMessage();
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideMessage = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(message.id);
    });
  };

  const getIconName = () => {
    switch (message.type) {
      case 'success': return 'checkmark.circle.fill';
      case 'error': return 'xmark.circle.fill';
      case 'warning': return 'exclamationmark.triangle.fill';
      case 'info': return 'info.circle.fill';
      default: return 'info.circle.fill';
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return '#2196F3';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ThemedView style={[styles.messageContainer, { backgroundColor: getBackgroundColor() }]}>
        <IconSymbol name={getIconName()} size={20} color="white" />
        <ThemedText style={styles.messageText}>{message.message}</ThemedText>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageText: {
    color: 'white',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
});
