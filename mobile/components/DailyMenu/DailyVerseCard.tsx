import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { styles } from './DailyMenu.styles'
import { Colors } from '../../constants/colors'

interface Props {
    verse: string
    translation: string
    onPress?: () => void
}

const DailyVerseCard = ({ verse, translation, onPress }: Props) => {
  return (
    <View style={styles.practiceItem}>
        <TouchableOpacity className='flex-row px-4 py-2 gap-3' onPress={onPress}>
            <Text style={{color: Colors.accent}} className='text-xs'>
                {verse}
            </Text>
            <View className='bg-translation_daily justify-center rounded'>
                <Text className='text-xs px-1 text-muted-fg'>
                    {translation}
                </Text>
            </View>
        </TouchableOpacity>
    </View>
  )
}

export default DailyVerseCard