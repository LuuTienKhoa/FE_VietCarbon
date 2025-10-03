import { FlashMessage, FlashMessageComponent } from '@/components/flash-message';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface FlashMessageContextType {
  showMessage: (message: Omit<FlashMessage, 'id'>) => void;
  hideMessage: (id: string) => void;
  clearAll: () => void;
}

const FlashMessageContext = createContext<FlashMessageContextType | undefined>(undefined);

export function FlashMessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<FlashMessage[]>([]);

  const showMessage = useCallback((message: Omit<FlashMessage, 'id'>) => {
    const id = Date.now().toString();
    const newMessage: FlashMessage = {
      ...message,
      id,
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const hideMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <FlashMessageContext.Provider value={{ showMessage, hideMessage, clearAll }}>
      {children}
      <View style={styles.container}>
        {messages.map(message => (
          <FlashMessageComponent
            key={message.id}
            message={message}
            onHide={hideMessage}
          />
        ))}
      </View>
    </FlashMessageContext.Provider>
  );
}

export function useFlashMessage() {
  const context = useContext(FlashMessageContext);
  if (context === undefined) {
    throw new Error('useFlashMessage must be used within a FlashMessageProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
});
