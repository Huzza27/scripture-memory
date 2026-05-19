import { useEffect, useState } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DragProvider } from "../context/DragContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useTheme } from "../utils/theme";
import { verseStorage } from "../utils/storage";
import MigrateLocalDataModal from "../components/MigrateLocalDataModal";
import bibleApi from "../api/bibleApi";
import { pullFromCloud } from "../utils/cloudPull";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

function AuthGate() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const onLoginScreen = segments[0] === 'login';
    if (!token && !onLoginScreen) {
      router.replace('/login');
    } else if (token && onLoginScreen) {
      router.replace('/');
    }
  }, [token, loading, segments]);

  return null;
}

function TokenSync() {
  const { token } = useAuth();
  useEffect(() => {
    bibleApi.setToken(token);
  }, [token]);
  return null;
}

function MigrateGate() {
  const { token } = useAuth();
  const [showMigrate, setShowMigrate] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!token) { setChecked(false); return; }
    if (checked) return;
    setChecked(true);
    (async () => {
      const verses = await verseStorage.getSavedVerses();
      if (verses.length > 0) {
        setShowMigrate(true);
      } else {
        // No local data — pull cloud data into local storage immediately
        pullFromCloud().catch(() => {});
      }
    })();
  }, [token, checked]);

  async function handleMigrationDone() {
    setShowMigrate(false);
    // Upload is done; pull to ensure local state matches server
    pullFromCloud().catch(() => {});
  }

  if (!showMigrate) return null;
  return <MigrateLocalDataModal visible={true} onDone={handleMigrationDone} />;
}

function AppTabs() {
  const theme = useTheme();
  return (
    
    <GluestackUIProvider mode="dark">
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="practice" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="verse/[id]" options={{ href: null }} />
      <Tabs.Screen name="folders" options={{ href: null }} />
      <Tabs.Screen name="folders/[id]" options={{ href: null }} />
      <Tabs.Screen name="flashcards/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </GluestackUIProvider>
  
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <DragProvider>
        <AuthProvider>
          <AuthGate />
          <TokenSync />
          <MigrateGate />
          <AppTabs />
        </AuthProvider>
      </DragProvider>
    </PreferencesProvider>
  );
}
