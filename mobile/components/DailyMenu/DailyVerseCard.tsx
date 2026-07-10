// DAILY VERSE CARD — components/DailyMenu/DailyVerseCard.tsx
// A single row in the expanded DailyMenu verse list.
// Displays: verse reference, translation badge, last-practiced date, and a chevron.
// Tapping it calls onPress with a Verse object — DailyMenu uses this to navigate to /practice/[id].
//
// Note: The Verse object is built from the `verse` string prop here (no data layer yet).
// The id is derived by slugifying the reference (e.g. "John 3:16" → "john-3-16").

import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from './DailyMenu.styles'
import { Colors } from '../../constants/colors'
import { Verse } from '../../types/Verse'

interface Props {
    verse: string       // Reference string, e.g. "John 3:16"
    translation: string // Translation code, e.g. "NIV"
    onPress?: (verse: Verse) => void
}

const DailyVerseCard = ({ verse, translation, onPress }: Props) => {
  // Build a Verse object from the props — id is a URL-safe slug of the reference
  const verseObj: Verse = { id: verse.toLowerCase().replace(/\s|:/g, '-'), reference: verse, translation, text: '' }

  return (
    <TouchableOpacity
        onPress={() => onPress?.(verseObj)}
        activeOpacity={0.6}
        style={[styles.practiceItem, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7 }]}
    >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            {/* Verse reference (e.g. "JOHN 3:16") */}
            <Text style={{ color: Colors.accent, fontSize: 11, letterSpacing: 1, fontFamily: 'JetBrainsMono_500Medium' }}>
                {verse}
            </Text>
            {/* Translation badge (e.g. "NIV") */}
            <View style={{ backgroundColor: Colors.secondary, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 }}>
                <Text style={{ color: Colors.mutedForeground, fontSize: 9, fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 0.3 }}>
                    {translation}
                </Text>
            </View>
            {/* Last practiced timestamp — hardcoded placeholder for now */}
            <Text style={{ color: Colors.mutedForeground, fontSize: 10, fontFamily: 'JetBrainsMono_400Regular' }}>
                Last: 2d ago
            </Text>
        </View>
        <Ionicons name="chevron-forward" size={12} color={Colors.mutedForeground} />
    </TouchableOpacity>
  )
}

export default DailyVerseCard