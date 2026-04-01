import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TranslationPicker from "../components/TranslationPicker";
import { getDefaultTranslation, setDefaultTranslation } from "../utils/preferences";

export default function Settings() {
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

      // Show saved indicator briefly
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving translation:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App Preferences</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Translation</Text>
          <Text style={styles.sectionDescription}>
            Choose your preferred Bible translation. This will be used by default when searching for verses.
          </Text>

          <TranslationPicker
            selectedTranslation={defaultTranslation}
            onTranslationChange={handleTranslationChange}
          />

          {saved && (
            <View style={styles.savedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.savedText}>Saved!</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    padding: 20,
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  savedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  savedText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
