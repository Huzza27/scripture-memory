import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Verse } from '../../types/Verse'
import { Pack } from '../../types/Pack'

interface props {
    title: string
    onPress: (pack: Pack) => void
    pack: Pack

}

const VersePackList = ({ pack, onPress, title }: props) => {
    const displayVerses = pack.verses.slice(0, 3)
    const overflow = pack.verses.length - displayVerses.length
    const progress = pack.verses.length > 0 ? Math.round((1 / pack.verses.length) * 100) : 0

    return (
        <TouchableOpacity
            className='bg-card border rounded-lg'
            style={{ borderColor: 'rgba(44, 30, 15, 0.15)', minHeight: 150 }}
            activeOpacity={0.75}
            onPress={() => onPress?.(pack)}
        >
            {/* Header: pack letter + chevron */}
            <View className='flex-row justify-between px-3 pt-2.5 pb-0.5'>
                <Text className='color-muted' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1 }}>
                    V
                </Text>
                <Text className='color-muted' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10 }}>
                    {'>'}
                </Text>
            </View>

            {/* Title + description */}
            <View className='px-3 pt-0.5 pb-1.5'>
                <Text className='color-foreground mb-0.5' style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 18, lineHeight: 24 }}>
                    {title}
                </Text>
                <Text className='color-muted-fg' style={{ fontFamily: 'SourceSerif4_400Regular', fontSize: 12, lineHeight: 17 }}>
                    {pack.verses.length} verses
                </Text>
            </View>

            {/* Verse reference list */}
            <View className='px-3 pb-2'>
                {displayVerses.map((v, i) => (
                    <Text key={i} className='color-muted-fg' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, lineHeight: 17 }}>
                        {v.reference}
                    </Text>
                ))}
                {overflow > 0 && (
                    <Text className='color-accent mt-0.5' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10 }}>
                        +{overflow} more
                    </Text>
                )}
            </View>

            {/* Stats + progress bar */}
            <View className='flex-row justify-between px-3 pb-1'>
                <Text className='color-muted-fg' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10 }}>
                    {pack.verses.length} verses
                </Text>
                <Text className='color-muted-fg' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10 }}>
                    0 mastered
                </Text>
            </View>
            <View className='px-3 pb-2.5'>
                <View className='bg-muted rounded h-0.5'>
                    <View className='bg-accent h-0.5 rounded' style={{ width: `${progress}%` }} />
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default VersePackList
