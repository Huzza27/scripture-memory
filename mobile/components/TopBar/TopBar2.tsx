// TopBar2 — "Dashboard"
// Functional header with date + streak info.

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function TopBar2() {
  return (
    <View
      style={{
        backgroundColor: Colors.background,
        paddingTop: 48,
        paddingBottom: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      {/* Left: Greeting + Date */}
      <View>
        <Text
          style={{
            fontFamily: 'JetBrainsMono_400Regular',
            fontSize: 11,
            color: Colors.mutedForeground,
            letterSpacing: 0.5,
            marginBottom: 2,
          }}
        >
          Good Morning
        </Text>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 22,
            color: Colors.foreground,
            lineHeight: 26,
          }}
        >
          June 26
        </Text>
      </View>

      {/* Right: Streak */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="flame" size={20} color={Colors.accent} />
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_700Bold',
              fontSize: 22,
              color: Colors.accent,
              lineHeight: 26,
            }}
          >
            12
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'JetBrainsMono_400Regular',
            fontSize: 9,
            color: Colors.mutedForeground,
            letterSpacing: 0.5,
            marginTop: 2,
          }}
        >
          day streak
        </Text>
      </View>
    </View>
  );
}
