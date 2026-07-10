// VERSE PRACTICE MODE SELECTION — components/VersePracticeModeSelection.tsx
// A bottom sheet modal that slides up from the bottom when opened.
// Shown when the user taps "PRACTICE ALL" in DailyMenu.
// Lets the user choose how they want to practice: "PRACTICE" or "LISTEN" (song playback).
//
// Animation approach:
//   - Uses a `mounted` flag + `translateY` so the sheet can animate OUT before unmounting.
//   - Without this, unmounting immediately would make the slide-out animation never visible.
//   - `runOnJS(setMounted)(false)` is called from the animation thread after slide-out completes.
//
// Tapping the dimmed backdrop (outside the sheet) closes it via onClose.

import React, { useEffect, useState } from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated'

interface Props {
  visible: boolean    // Controlled externally — true = slide up, false = slide down and unmount
  verse: string
  translation: string
  onPractice: () => void
  onFlashcards: () => void
  onClose: () => void
}

const VersePracticeModeSelection = ({ visible, verse, translation, onClose, onPractice, onFlashcards }: Props) => {
  const [mounted, setMounted] = useState(false) // Controls whether the Modal is in the tree at all
  const translateY = useSharedValue(400)         // Starts off-screen below (400px down)

  useEffect(() => {
    if (visible) {
      // Mount first, then animate in
      setMounted(true)
      translateY.value = withTiming(0, { duration: 250 })
    } else {
      // Animate out, then unmount after animation completes
      translateY.value = withTiming(400, { duration: 200 }, () => {
        runOnJS(setMounted)(false) // Called on JS thread after animation finishes
      })
    }
  }, [visible])

  const animatedSheet = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  // Don't render anything if not mounted (after slide-out is done)
  if (!mounted) return null

  return (
    <Modal visible={mounted} transparent animationType="none">
      {/* Full-screen container with dimmed backdrop */}
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>

        {/* Tapping the backdrop closes the sheet */}
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

        {/* The sliding sheet itself */}
        <Animated.View style={animatedSheet} className="bg-surface rounded-t-xl p-6">
          {/* Verse reference label at the top of the sheet */}
          <Text className="text-muted text-xs mb-4" style={{ fontFamily: 'JetBrainsMono_400Regular', letterSpacing: 2 }}>{verse} · {translation}</Text>

          {/* PRACTICE button — triggers active recall practice */}
          <TouchableOpacity className="bg-accent rounded-md items-center py-3 mb-3" onPress={onFlashcards}>
            <Text className="text-muted text-sm" style={{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 1.5 }}>PRACTICE</Text>
          </TouchableOpacity>

          {/* LISTEN button — plays the generated song for this verse */}
          <TouchableOpacity className="bg-primary rounded-md items-center py-3">
            <Text className="text-muted text-sm" style={{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 1.5 }}>LISTEN</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default VersePracticeModeSelection
