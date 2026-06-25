import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Colors } from '../../constants/colors'


const TopBar = () => {
  return (
    <View className='w-full pt-7' style={{backgroundColor: Colors.primary}}>
        <Text className='py-4'>
            Top Bar
        </Text>
    </View>
  )
}

export default TopBar
