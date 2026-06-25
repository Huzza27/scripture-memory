import "./global.css";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "./constants/colors";
import DailyMenu from "./components/DailyMenu/DailyMenu";
import TopMenu from "./components/TopBar/TopBar"

export default function App() {
  return (
    <View style={{flex: 1, backgroundColor: Colors.background}}>
      <TopMenu />
      <DailyMenu />
    </View>
  );
}