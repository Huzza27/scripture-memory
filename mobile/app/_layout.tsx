import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { PreferencesProvider } from "../context/PreferencesContext";
import { AuthProvider } from "../context/AuthContext";
import "@/global.css";

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <GluestackUIProvider mode="dark">
          <Stack screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
