// TopBar4 — "Verse Banner"
// Featured verse displayed prominently at top. Feels like an inspirational card.

import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

export default function TopBar4() {
  return (
    <View
      style={{
        backgroundColor: Colors.accent,
        paddingTop: 48,
        paddingBottom: 20,
        paddingHorizontal: 24,
      }}
    >
      <Text
        style={{
          fontFamily: 'JetBrainsMono_500Medium',
          fontSize: 9,
          letterSpacing: 3,
          color: Colors.muted,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        TODAY'S VERSE
      </Text>

      <Text
        style={{
          fontFamily: 'SourceSerif4_400Regular',
          fontSize: 15,
          color: Colors.muted,
          fontStyle: 'italic',
          lineHeight: 23,
          marginBottom: 10,
        }}
      >
        "For I can do all things through Christ"
      </Text>

      <Text
        style={{
          fontFamily: 'JetBrainsMono_400Regular',
          fontSize: 10,
          color: Colors.muted,
          opacity: 0.6,
          textAlign: 'right',
        }}
      >
        Phil. 4:13
      </Text>
    </View>
  );
}
