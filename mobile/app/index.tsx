import { View } from 'react-native'
import { Colors } from '../constants/colors'
import TopMenu from '../components/TopBar/TopBar'
import DailyMenu from '../components/DailyMenu/DailyMenu'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <TopMenu />
      <DailyMenu />
    </View>
  )
}
