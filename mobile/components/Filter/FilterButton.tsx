import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

interface props
{
    label: string
    highlighted: boolean
    onPress?: (label: string) => void
}

const FilterButton = ({ label, highlighted, onPress }: props) => {
  return (
    <View className='py-2 px-2'>
        <TouchableOpacity onPress={() => onPress?.(label)} className={`self-start border ${highlighted ? "bg-primary": "bg-transparent"} ${highlighted ? "border-transparent" : "border-black"} rounded`}>
            <Text className={`${highlighted ? "text-white" : "text-black"} tracking-wide px-2 py-0.5`} style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12 }}>
                {label}
            </Text>
        </TouchableOpacity>
    </View>
  )
}

export default FilterButton