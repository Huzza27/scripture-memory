// TopBar3 — "Minimal Strip"
// Ultra-thin, almost invisible header.

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function TopBar3() {
  return (
    <View
      style={{
        backgroundColor: Colors.background,
        paddingTop: 48,
        paddingBottom: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 20,
          color: Colors.foreground,
        }}
      >
        SM
      </Text>

      <View style={{ flex: 1 }} />

      <Ionicons name="settings-outline" size={20} color={Colors.mutedForeground} />
    </View>
  );
}
