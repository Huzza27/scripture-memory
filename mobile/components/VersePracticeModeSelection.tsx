import React, { useEffect, useState } from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated'

interface Props {
  visible: boolean
  verse: string
  translation: string
  onClose: () => void
}

const VersePracticeModeSelection = ({ visible, verse, translation, onClose }: Props) => {
  const [mounted, setMounted] = useState(false)
  const translateY = useSharedValue(400)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      translateY.value = withTiming(0, { duration: 250 })
    } else {
      translateY.value = withTiming(400, { duration: 200 }, () => {
        runOnJS(setMounted)(false)
      })
    }
  }, [visible])

  const animatedSheet = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!mounted) return null

  return (
    <Modal visible={mounted} transparent animationType="none">
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <Animated.View style={animatedSheet} className="bg-surface rounded-t-xl p-6">
          <Text className="text-muted text-xs tracking-widest mb-4">{verse} · {translation}</Text>
          <TouchableOpacity className="bg-accent rounded-md items-center py-3 mb-3">
            <Text className="text-muted text-sm">PRACTICE</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary rounded-md items-center py-3">
            <Text className="text-muted text-sm">LISTEN</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default VersePracticeModeSelection
