import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { MOCK_CONNECTION } from "../consts";
import GlobalEventEmitter from "../logic/GlobalEventEmitter";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from '../i18n/config';

export default function MessageBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const { top } = useSafeAreaInsets();

  useEffect(() => {
    const handleMessageChanged = ({ message, type }: { message: string, type: string }) => {
      setMessage(message);
      setType(type);
    };

    if (!MOCK_CONNECTION) {
      GlobalEventEmitter.on('SHOW_BANNER', handleMessageChanged);
    }

    return () => {
      if (!MOCK_CONNECTION) {
        GlobalEventEmitter.removeListener('SHOW_BANNER', handleMessageChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (message) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [message, slideAnim]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) { return null; }

  let backgroundColor;
  switch (type) {
    case 'success':
      backgroundColor = '#48BB78'; // Green
      break;
    case 'error':
      backgroundColor = '#F56565'; // Red
      break;
    default:
      backgroundColor = '#4299E1'; // Blue
      break;
  }

  return (
    // <SafeAreaView>
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: backgroundColor,
          marginTop: top,
        },
      ]}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={() => setMessage(null)}>
        <Text style={styles.dismiss}>{i18n.t('MessageBanner.Dismiss', {ns: 'home'})}</Text>
      </TouchableOpacity>
    </Animated.View>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1000,
  },
  text: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    marginRight: 10,
    flexWrap: 'wrap',
    fontFamily: 'Montserrat-Regular',
  },
  dismiss: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});

