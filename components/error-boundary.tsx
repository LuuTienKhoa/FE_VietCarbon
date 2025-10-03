import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { Component, ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <IconSymbol name="exclamationmark.triangle.fill" size={64} color="#FF6B6B" />
            <ThemedText type="title" style={styles.title}>
              Oops! Có lỗi xảy ra
            </ThemedText>
            <ThemedText style={styles.message}>
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
            </ThemedText>
            {__DEV__ && this.state.error && (
              <ThemedText style={styles.errorDetails}>
                {this.state.error.message}
              </ThemedText>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorDetails: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
