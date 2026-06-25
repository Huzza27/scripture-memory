import React, { useState } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import Animated, { useSharedValue, withTiming, withSequence, useAnimatedStyle } from 'react-native-reanimated'
import { Colors } from '../../constants/colors'
import { Ionicons } from "@expo/vector-icons";
import { styles } from './DailyMenu.styles';
import DailyVerseCard from './DailyVerseCard';
import VersePracticeModeSelection from '../VersePracticeModeSelection';



const DailyMenu = () => {

  const [toggleVerses, setToggleVerses] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{ verse: string; translation: string } | null>(null);
  const rotation = useSharedValue(0);
  const calendarScale = useSharedValue(1);

  const animatedArrow = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedCalendar = useAnimatedStyle(() => ({
    transform: [{ scale: calendarScale.value }]
  }))

  const handleToggle = () => {
    const opening = rotation.value === 0;
    rotation.value = withTiming(opening ? 180 : 0, { duration: 150 });
    calendarScale.value = withTiming(opening ? 1 : 0.75, { duration: 100 })
    setToggleVerses(prev => !prev);
  };



  return (
    <View className='w-full pt-5 px-4'>
      <TouchableOpacity className={`w-full bg-accent ${toggleVerses ? 'rounded-t-md' : 'rounded-md'}`} onPress={handleToggle} activeOpacity={0.8}>
        <View className='flex-row'>
          <View className='py-5 px-4 justify-center'>
              <Animated.View style={animatedCalendar}>
              <Ionicons name="calendar" size={18} color={Colors.muted}/>
            </Animated.View>
          </View>
          <View className='flex-col'>
            <Text className='text-xs pt-3 font-light color-muted tracking-widest'>
              TODAY'S SESSION
            </Text>
            <Text className='pb-3 tracking-tight color-muted'>
              28 verses scheduled
            </Text>
          </View>
          <View className='w-full justify-center items-center'>
            <Animated.View style={animatedArrow}>
              <Ionicons name="chevron-down" size={13} color={Colors.muted} />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
      {toggleVerses &&
      <View className='' style={styles.practiceItem}>
        <View className='py-3 px-4'>
          <TouchableOpacity className='bg-primary rounded items-center'>
            <Text className='py-2 color-muted text-xs'>
              PRACTICE ALL
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      }
      {toggleVerses &&
      <View className='' style={styles.practiceItem}>
        <DailyVerseCard verse="JOHN 3:16" translation='NIV' onPress={() => setSelectedVerse({ verse: 'JOHN 3:16', translation: 'NIV' })}/>
        <DailyVerseCard verse="John 3:16" translation='NIV' onPress={() => setSelectedVerse({ verse: 'John 3:16', translation: 'NIV' })}/>
        <DailyVerseCard verse="John 3:16" translation='NIV' onPress={() => setSelectedVerse({ verse: 'John 3:16', translation: 'NIV' })}/>
        <DailyVerseCard verse="John 3:16" translation='NIV' onPress={() => setSelectedVerse({ verse: 'John 3:16', translation: 'NIV' })}/>
      </View>
      }
      <VersePracticeModeSelection
        visible={selectedVerse !== null}
        verse={selectedVerse?.verse ?? ''}
        translation={selectedVerse?.translation ?? ''}
        onClose={() => setSelectedVerse(null)}
      />
    </View>
  )
}

export default DailyMenu

