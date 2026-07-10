import React from 'react'
import { Colors } from '../../constants/colors'
import { View, Text } from 'react-native'

interface Props
{
    reference: string
    translation: string
    timing: string  
}

const PackVerse = ({reference, translation, timing}: Props) => {
    return (
      <View
        className='flex-row items-center px-3 py-3 border-b'
        style={{ borderColor: Colors.border }}
      >
        {/* Bullet */}
        <View className='w-2 h-2 rounded-full bg-accent mr-3' />
  
        {/* Reference */}
        <Text
          className='flex-1'
          style={{ fontFamily: 'JetBrainsMono_500Medium', fontSize: 10, letterSpacing: 1, color: Colors.foreground }}
        >
          {reference.toUpperCase()}
        </Text>
  
        {/* Translation badge */}
        <View className='border rounded px-1.5 py-0.5 mr-2' style={{ borderColor: Colors.border }}>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: Colors.mutedForeground }}>
            {translation}
          </Text>
        </View>
  
        {/* Timing */}
        {timing ? (
          <Text className='mr-2' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: Colors.mutedForeground }}>
            {timing}
          </Text>
        ) : null}
  
        {/* Status */}
        <Text style={{
          fontFamily: 'JetBrainsMono_400Regular',
          fontSize: 10,
          color: Colors.accent
        }}>
        </Text>
      </View>
    )
}

export default PackVerse