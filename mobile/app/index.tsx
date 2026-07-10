// HOME SCREEN — app/index.tsx
// The main screen of the app. Composed of two stacked sections:
//   - TopBar:    Navigation/header bar at the top
//   - DailyMenu: The today's session panel (expandable list of scheduled verses)

import { View } from 'react-native'
import { Colors } from '../constants/colors'
import TopMenu from '../components/TopBar/TopBarSwitcher'
import DailyMenu from '../components/DailyMenu/DailyMenu'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <TopMenu />
      <DailyMenu />
    </View>
  )
}
