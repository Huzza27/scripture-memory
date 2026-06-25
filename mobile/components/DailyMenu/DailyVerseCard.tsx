import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from './DailyMenu.styles'
import { Colors } from '../../constants/colors'
import { Verse } from '../../types/Verse'

interface Props {
    verse: string
    translation: string
    onPress?: (verse: Verse) => void
}

const DailyVerseCard = ({ verse, translation, onPress }: Props) => {
  const verseObj: Verse = { id: verse.toLowerCase().replace(/\s|:/g, '-'), reference: verse, translation, text: '' }

  return (
    <TouchableOpacity
        onPress={() => onPress?.(verseObj)}
        activeOpacity={0.6}
        style={[styles.practiceItem, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7 }]}
    >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ color: Colors.accent, fontSize: 11, letterSpacing: 1, fontFamily: 'Lora_700Bold' }}>
                {verse}
            </Text>
            <View style={{ backgroundColor: Colors.secondary, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 }}>
                <Text style={{ color: Colors.mutedForeground, fontSize: 9, fontWeight: '600', letterSpacing: 0.3 }}>
                    {translation}
                </Text>
            </View>
            <Text style={{ color: Colors.mutedForeground, fontSize: 10, fontFamily: 'Lora_400Regular' }}>
                Last: 2d ago
            </Text>
        </View>
        <Ionicons name="chevron-forward" size={12} color={Colors.mutedForeground} />
    </TouchableOpacity>
  )
}

export default DailyVerseCard