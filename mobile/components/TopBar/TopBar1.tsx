// TopBar1 — "Masthead"
// Large centered app title. Dark primary background. Tall, bookish feel.

import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

export default function TopBar1() {
  return (
    <View
      style={{
        backgroundColor: Colors.primary,
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: 'JetBrainsMono_500Medium',
          fontSize: 10,
          letterSpacing: 4,
          color: Colors.mutedForeground,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        SCRIPTURE
      </Text>

      <Text
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 32,
          color: Colors.muted,
          lineHeight: 38,
        }}
      >
        Memory
      </Text>

      {/* Thin accent-colored rule line */}
      <View
        style={{
          marginTop: 14,
          width: '40%',
          height: 1,
          backgroundColor: Colors.accent,
        }}
      />
    </View>
  );
}
