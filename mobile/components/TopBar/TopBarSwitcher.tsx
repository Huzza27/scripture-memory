// TopBarSwitcher — Test switcher UI
// Renders all 5 prototypes with a tab strip to switch between them.

import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TopBar1 from './TopBar1';
import TopBar2 from './TopBar2';
import TopBar3 from './TopBar3';
import TopBar4 from './TopBar4';
import TopBar5 from './TopBar5';
import { Colors } from '../../constants/colors';

const bars = [TopBar1, TopBar2, TopBar3, TopBar4, TopBar5];
const labels = ['Masthead', 'Dashboard', 'Minimal', 'Verse', 'Stats'];

export default function TopBarSwitcher() {
  const [active, setActive] = useState(0);
  const ActiveBar = bars[active];
  return (
    <View style={{ flex: 0 }} className='pb-5'>
      <ActiveBar />
      {/* Tab strip to switch — render below the active bar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.card,
          borderBottomWidth: 1,
          borderColor: Colors.border,
        }}
      >
        {labels.map((label, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setActive(i)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: active === i ? Colors.accent : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: 'JetBrainsMono_400Regular',
                fontSize: 9,
                letterSpacing: 0.5,
                color: active === i ? Colors.accent : Colors.mutedForeground,
              }}
            >
              {i + 1}
            </Text>
            <Text
              style={{
                fontFamily: 'JetBrainsMono_400Regular',
                fontSize: 8,
                color: active === i ? Colors.accent : Colors.mutedForeground,
              }}
            >
              {label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
