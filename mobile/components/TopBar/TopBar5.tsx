// TopBar5 — "Stats Row"
// Three stat blocks side by side on a dark primary background.

import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface StatBlockProps {
  value: string;
  label: string;
  showDivider?: boolean;
}

function StatBlock({ value, label, showDivider }: StatBlockProps) {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {showDivider && (
        <View
          style={{
            width: 1,
            backgroundColor: Colors.muted,
            opacity: 0.2,
            marginVertical: 6,
          }}
        />
      )}
      <View style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 28,
            color: Colors.primaryForeground,
            lineHeight: 32,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: 'JetBrainsMono_400Regular',
            fontSize: 9,
            color: Colors.muted,
            letterSpacing: 1.5,
            marginTop: 3,
            opacity: 0.5,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

export default function TopBar5() {
  return (
    <View
      style={{
        backgroundColor: Colors.primary,
        paddingTop: 48,
        paddingBottom: 6,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'JetBrainsMono_500Medium',
          fontSize: 9,
          letterSpacing: 3,
          color: Colors.muted,
          textAlign: 'center',
          marginBottom: 6,
          opacity: 0.45,
        }}
      >
        SCRIPTURE MEMORY
      </Text>
      <View
        style={{
          width: '28%',
          height: 1,
          backgroundColor: Colors.accent,
          alignSelf: 'center',
          marginBottom: 2,
          opacity: 0.55,
        }}
      />

      <View style={{ flexDirection: 'row' }}>
        <StatBlock value="14" label="STREAK" />
        <StatBlock value="5" label="TODAY" showDivider />
        <StatBlock value="47" label="MASTERED" showDivider />
      </View>
    </View>
  );
}
