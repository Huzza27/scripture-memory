// TOP BAR — components/TopBar/TopBar.tsx
// The header bar displayed at the top of the Home Screen.
// Currently a placeholder — will eventually hold things like the app title,
// navigation controls, or a settings/profile button.

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
