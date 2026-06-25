import { Stack } from 'expo-router'
import { useFonts, Lora_400Regular, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora'
import "../global.css"

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Lora_400Regular, Lora_600SemiBold, Lora_700Bold })

  if (!fontsLoaded) return null

  return <Stack screenOptions={{ headerShown: false }} />
}
