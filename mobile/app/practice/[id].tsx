import { View, Text, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Colors } from '../../constants/colors'
import { useRouter } from 'expo-router'
export default function PracticeScreen() {

  const { id } = useLocalSearchParams()
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background}}>
      <Text style={{ color: Colors.foreground, fontFamily: 'Lora_700Bold', fontSize: 18 }}>
        {id}
      </Text>

      <TouchableOpacity onPress={router.back}>
        <Text>
          back
        </Text>
      </TouchableOpacity>

    </View>
  )
}
