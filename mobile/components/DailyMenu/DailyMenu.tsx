// DAILY MENU — components/DailyMenu/DailyMenu.tsx
// The collapsible "Today's Session" panel on the Home Screen.
//
// Structure:
//   - A tappable header row showing the session summary ("28 verses scheduled")
//   - When expanded, shows:
//       1. A "PRACTICE ALL" button — opens the practice mode bottom sheet
//       2. A list of DailyVerseCard rows (one per scheduled verse)
//   - Tapping a verse card navigates directly to /practice/[id]
//   - Tapping "PRACTICE ALL" opens VersePracticeModeSelection (bottom sheet modal)
//
// Animations:
//   - The chevron arrow rotates 180° when expanded
//   - The calendar icon shrinks slightly when expanded (subtle feedback)

import React, { useState } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import Animated, { useSharedValue, withTiming, withSequence, useAnimatedStyle } from 'react-native-reanimated'
import { Colors } from '../../constants/colors'
import { Ionicons } from "@expo/vector-icons";
import { styles } from './DailyMenu.styles';
import DailyVerseCard from './DailyVerseCard';
import VersePracticeModeSelection from '../VersePracticeModeSelection';
import { Verse } from '../../types/Verse';
import { useRouter } from 'expo-router';
import Filter from '../Filter/Filter';
import VersePackList from '../Packs/VersePackList';
import { createPack, Pack } from '../../types/Pack';


const DailyMenu = () => {

  const [toggleVerses, setToggleVerses] = useState(false);           // Whether the verse list is expanded
  const FilterType = {
    Category: "category",
    Translation: "date",
    Book: "favorite",
    Month: "month"
  } as const

  type FilterType = typeof FilterType[keyof typeof FilterType]

  const [packList, setPackList] = useState<Record<string, Pack>>({});


  const [allVerses, setAllVerses] = useState<Verse[] | null>([
    { id: 'john-3-16',          reference: 'John 3:16',          translation: 'NIV', text: 'For God so loved the world...',                    category: 'Faith',   book: 'John',        month: 'January' },
    { id: 'romans-8-28',        reference: 'Romans 8:28',        translation: 'NIV', text: 'And we know that in all things God works for good...', category: 'Faith',   book: 'Romans',      month: 'January' },
    { id: 'psalm-23-1',         reference: 'Psalm 23:1',         translation: 'ESV', text: 'The Lord is my shepherd; I shall not want.',         category: 'Comfort', book: 'Psalms',      month: 'February' },
    { id: 'psalm-46-1',         reference: 'Psalm 46:1',         translation: 'ESV', text: 'God is our refuge and strength...',                  category: 'Comfort', book: 'Psalms',      month: 'February' },
    { id: 'isaiah-40-31',       reference: 'Isaiah 40:31',       translation: 'NIV', text: 'But those who hope in the Lord will renew their strength...', category: 'Strength', book: 'Isaiah',    month: 'March' },
    { id: 'philippians-4-13',   reference: 'Philippians 4:13',   translation: 'NIV', text: 'I can do all this through him who gives me strength.', category: 'Strength', book: 'Philippians', month: 'March' },
    { id: 'proverbs-3-5',       reference: 'Proverbs 3:5',       translation: 'ESV', text: 'Trust in the Lord with all your heart...',           category: 'Faith',   book: 'Proverbs',    month: 'January' },
    { id: 'matthew-11-28',      reference: 'Matthew 11:28',      translation: 'NIV', text: 'Come to me, all you who are weary and burdened...', category: 'Comfort', book: 'Matthew',     month: 'February' },
    { id: 'romans-5-8',         reference: 'Romans 5:8',         translation: 'ESV', text: 'But God shows his love for us...',                   category: 'Faith',   book: 'Romans',      month: 'January' },
    { id: 'philippians-4-6',    reference: 'Philippians 4:6',    translation: 'NIV', text: 'Do not be anxious about anything...',               category: 'Strength', book: 'Philippians', month: 'March' },
  ])
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null); // Verse the user last tapped
  const [filterType, setFilterType] = useState<FilterType>(FilterType.Category)
  const [togglePracticeTypeMenu, setTogglePracticeTypeMenu] = useState(false) // Controls the bottom sheet modal
  const rotation = useSharedValue(0);      // Drives the chevron rotation animation
  const calendarScale = useSharedValue(1); // Drives the calendar icon scale animation
  const router = useRouter()

  // Chevron rotates 0→180 when opening, 180→0 when closing
  const animatedArrow = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Calendar shrinks slightly when panel is open
  const animatedCalendar = useAnimatedStyle(() => ({
    transform: [{ scale: calendarScale.value }]
  }))

  // Toggle the verse list open/closed and animate both icons
  const handleToggle = () => {
    const opening = rotation.value === 0;
    rotation.value = withTiming(opening ? 180 : 0, { duration: 150 });
    calendarScale.value = withTiming(opening ? 1 : 0.75, { duration: 100 })
    setToggleVerses(prev => !prev);
  };

  // Tapping an individual verse card → navigate directly to its practice screen
  const handleVersePress = (verse: Verse) => {
    setSelectedVerse(verse)
    router.push(`/practice/${verse.id}`)
  }

  const handlePackPress = (pack: Pack) => {
    router.push({ pathname: `/packs/${pack.id}`, params: { data: JSON.stringify(pack) } })
  }

  // Tapping "PRACTICE ALL" → open the bottom sheet to choose practice mode
  const handlePracticeAll = () => {
    setTogglePracticeTypeMenu(!togglePracticeTypeMenu)
  }


  const groupBy = (key: keyof Verse) => {
    if (!allVerses) return
    const result: Record<string, Pack> = {}
    allVerses.forEach(v => {
      const k = v[key] as string

      if(result[k] === undefined)
      {
        result[k] = createPack(k,'', [v])
      }
      else
      {
        result[k].verses = [...result[k].verses, v]
      }
    })

    setPackList(result)
  }

  const labelToFilterType: Record<string, FilterType> = {
    Category:    FilterType.Category,
    Translation: FilterType.Translation,
    Book:        FilterType.Book,
    Month:       FilterType.Month,
  }


  //TODO make packs be stored once filtered for quick retrieval
  const handlePackFilter = (label: string) => {
    const filter = labelToFilterType[label]
    if (!filter || !allVerses) return
    setFilterType(filter)

    if (filter === FilterType.Category)         groupBy('category')
    else if (filter === FilterType.Book)        groupBy('book')
    else if (filter === FilterType.Translation) groupBy('translation')
    else if (filter === FilterType.Month)       groupBy('month')
  }
  return (
    <View className='w-full px-4'>

      {/* ── Collapsible header row ── */}
      <TouchableOpacity className={`w-full bg-accent ${toggleVerses ? 'rounded-t-md' : 'rounded-md'}`} onPress={handleToggle} activeOpacity={0.8}>
        <View className='flex-row'>
          {/* Calendar icon (shrinks when open) */}
          <View className='py-5 px-4 justify-center'>
            <Animated.View style={animatedCalendar}>
              <Ionicons name="calendar" size={18} color={Colors.muted}/>
            </Animated.View>
          </View>
          {/* Session label + verse count */}
          <View className='flex-col'>
            <Text className='text-xs pt-3 color-muted' style={{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 2 }}>
              TODAY'S SESSION
            </Text>
            <Text className='pb-3 color-muted' style={{ fontFamily: 'SourceSerif4_400Regular', fontSize: 14 }}>
              28 verses scheduled
            </Text>
          </View>
          {/* Chevron arrow (rotates when open) */}
          <View className='w-full justify-center items-center'>
            <Animated.View style={animatedArrow}>
              <Ionicons name="chevron-down" size={13} color={Colors.muted} />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── "PRACTICE ALL" button — only visible when expanded ── */}
      {toggleVerses &&
        <View style={styles.practiceItem}>
          <View className='py-3 px-4'>
            <TouchableOpacity className='bg-primary rounded items-center' onPress={handlePracticeAll}>
              <Text className='py-2 color-muted text-xs' style={{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 1.5 }}>
                PRACTICE ALL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      }

      {/* ── Verse list — only visible when expanded ── */}
      {/* TODO: Replace hardcoded cards with real data from storage */}
      {toggleVerses &&
        <View style={styles.practiceItem}>
          <DailyVerseCard verse="JOHN 3:16" translation='NIV' onPress={handleVersePress}/>
          <DailyVerseCard verse="John 3:16" translation='NIV' onPress={handleVersePress}/>
          <DailyVerseCard verse="John 3:16" translation='NIV' onPress={handleVersePress}/>
          <DailyVerseCard verse="John 3:16" translation='NIV' onPress={handleVersePress}/>
        </View>
      }

      {/* ── Bottom sheet modal for choosing practice mode (Practice / Listen) ── */}
      <VersePracticeModeSelection
        visible={togglePracticeTypeMenu}
        verse={selectedVerse?.reference ?? ''}
        translation={selectedVerse?.translation ?? ''}
        onClose={() => setTogglePracticeTypeMenu(false)}
        onPractice={() => {}}
        onFlashcards={() => {}}
      />
    <Filter onFilterChange={handlePackFilter} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
        {Object.entries(packList).map(([key, pack]) => (
          <View key={key} style={{ width: '47%' }}>
            <VersePackList pack={pack} title={key} onPress={handlePackPress}/>
          </View>
        ))}
      </View>
    </View>



  )
}

export default DailyMenu

