// ROOT LAYOUT — app/_layout.tsx
// Entry point for Expo Router. Wraps the entire app.
// Responsibilities:
//   - Loads all three app fonts (see font roles below)
//   - Blocks rendering until fonts are ready (avoids unstyled flash)
//   - Sets up the navigation stack with no default header (all screens handle their own UI)
//
// Font roles:
//   PlayfairDisplay_700Bold  — headings, masthead title, stat numbers
//   SourceSerif4_400Regular  — body text, verse text, descriptions
//   JetBrainsMono_400Regular — UI chrome: labels, badges, filters, references, metadata

import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display'
import { SourceSerif4_400Regular, SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4'
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono'
import "../global.css"

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  })

  // Don't render anything until fonts are loaded — avoids layout shift
  if (!fontsLoaded) return null

  return <Stack screenOptions={{ headerShown: false }} />
}
