import { useState, useEffect } from "react";
import { Text, View, ActivityIndicator, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TranslationPicker from "../components/TranslationPicker";
import ScreenHeader from "../components/ScreenHeader";
import { useTheme } from "../utils/theme";
import { getDefaultTranslation, setDefaultTranslation, setHideVerseText } from "../utils/preferences";
import { usePreferences } from "../context/PreferencesContext";

export default function Settings() {
  const theme = useTheme();
  const { prefs, refresh } = usePreferences();
  const [defaultTranslation, setDefaultTranslationState] = useState<string>('kjv');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const translation = await getDefaultTranslation();
      setDefaultTranslationState(translation);
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = async (code: string) => {
    try {
      setDefaultTranslationState(code);
      await setDefaultTranslation(code);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving translation:", error);
    }
  };

  const handleHideVerseTextToggle = async (value: boolean) => {
    try {
      await setHideVerseText(value);
      await refresh();
    } catch (error) {
      console.error("Error saving hideVerseText:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Settings" subtitle="App Preferences" />

      <View className="p-5 flex-1">
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Default Translation</Text>
          <Text className="text-sm leading-5 mb-4" style={{ color: theme.textSecondary }}>
            Choose your preferred Bible translation. This will be used by default when searching for verses.
          </Text>

          <TranslationPicker
            selectedTranslation={defaultTranslation}
            onTranslationChange={handleTranslationChange}
          />

          {saved && (
            <View className="flex-row items-center mt-3 gap-2">
              <Ionicons name="checkmark-circle" size={20} color={theme.green} />
              <Text className="text-sm font-semibold" style={{ color: theme.green }}>Saved!</Text>
            </View>
          )}
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Memorization Mode</Text>
          <Text className="text-sm leading-5 mb-4" style={{ color: theme.textSecondary }}>
            Hide verse text throughout the app so you can test yourself without accidentally seeing the words.
          </Text>
          <View
            className="flex-row items-center justify-between rounded-xl p-3.5 border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-2.5">
              <Ionicons name="eye-off-outline" size={20} color={theme.textSecondary} />
              <Text className="text-base font-semibold" style={{ color: theme.text }}>Hide verse text</Text>
            </View>
            <Switch
              value={prefs.hideVerseText}
              onValueChange={handleHideVerseTextToggle}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
