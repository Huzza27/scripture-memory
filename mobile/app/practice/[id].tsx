// PRACTICE SCREEN — app/practice/[id].tsx
// Opened when a user taps a verse card from the DailyMenu.
// The [id] in the filename is a dynamic route — Expo Router passes the verse ID via URL params.
// Example route: /practice/john-3-16
//
// Currently a stub — just displays the verse ID and a back button.
// This is where the actual practice UI (fill-in-the-blank, recitation, etc.) will live.
import { View, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '../../constants/colors'
import { useRouter } from 'expo-router'
import TopMenu from '../../components/TopBar/TopBarSwitcher'
import { Ionicons } from '@expo/vector-icons'

export default function PracticeScreen() {
  // `id` comes from the URL — e.g. navigating to /practice/john-3-16 gives id = "john-3-16"
  const { id } = useLocalSearchParams()
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background}}>
      <TopMenu />

      {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className='flex-row items-center pt-5 pb-3'>
          <Ionicons name='chevron-back' size={12} color={Colors.mutedForeground} />
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: Colors.mutedForeground, letterSpacing: 1 }}>
            BACK
          </Text>
        </TouchableOpacity>

        
    </View>
  )
}
