import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import TopMenu from '../../components/TopBar/TopBarSwitcher'
import { Pack } from '../../types/Pack'
import PackVerse from '../../components/Packs/PackVerse'

export default function PackView() {
  const { id, data } = useLocalSearchParams()
  const router = useRouter()

  if (!data) return null

  const pack: Pack = JSON.parse(data as string)
  const title = typeof id === 'string' ? id : 'Pack'
  const description = pack.description
  const verseCount = pack.verses.length
  const masteredCount = 0  // TODO: track mastered state
  const inProgressCount = verseCount - masteredCount

  return (

    
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <TopMenu />

      <ScrollView className='flex-1 px-5' showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className='flex-row items-center pt-5 pb-3'>
          <Ionicons name='chevron-back' size={12} color={Colors.mutedForeground} />
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: Colors.mutedForeground, letterSpacing: 1 }}>
            BACK
          </Text>
        </TouchableOpacity>

        {/* Pack letter */}
        <Text className='mb-1' style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: Colors.muted, letterSpacing: 1 }}>
          V
        </Text>

        {/* Title + description + button row */}
        <View className='flex-row justify-between items-start mb-5'>
          <View className='flex-1 mr-4'>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 28, lineHeight: 34, color: Colors.foreground }}>
              {title}
            </Text>
            <Text style={{ fontFamily: 'SourceSerif4_400Regular', fontSize: 13, color: Colors.mutedForeground, lineHeight: 18 }}>
              {description}
            </Text>
          </View>
          <TouchableOpacity
            className='flex-row items-center rounded px-3 py-2'
            style={{ backgroundColor: Colors.accent }}
          >
            <Text style={{ fontFamily: 'JetBrainsMono_500Medium', fontSize: 10, letterSpacing: 1.5, color: Colors.primaryForeground }}>
              REVIEW PACK
            </Text>
            <Ionicons name='chevron-down' size={11} color={Colors.primaryForeground} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View
          className='flex-row rounded-lg mb-4 overflow-hidden border'
          style={{ borderColor: Colors.border }}
        >
          {[
            { value: verseCount,     label: 'VERSES' },
            { value: masteredCount,  label: 'MASTERED' },
            { value: inProgressCount, label: 'IN PROGRESS' },
          ].map((stat, i) => (
            <View
              key={i}
              className='flex-1 items-center py-3'
              style={{ borderLeftWidth: i > 0 ? 1 : 0, borderColor: Colors.border }}
            >
              <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 22, color: Colors.foreground }}>
                {stat.value}
              </Text>
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, letterSpacing: 1.5, color: Colors.mutedForeground, marginTop: 2 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Verse list */}
        <View className='rounded-lg overflow-hidden border' style={{ borderColor: Colors.border }}>
          {pack.verses.map((verse) => (
            <PackVerse key={verse.id} reference={verse.reference} translation={verse.translation} timing=''/>
          ))}
        </View>

        {/* Footer */}
        <View className='flex-row justify-between pt-8 pb-6'>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, letterSpacing: 2, color: Colors.muted }}>
            SCRIPTURE MEMORY
          </Text>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: Colors.muted }}>
            2026
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}
