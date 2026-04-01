import { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from "react-native";
import bibleApi from "../api/bibleApi";
import { verseStorage } from "../utils/storage";
import { Ionicons } from "@expo/vector-icons";
import TranslationPicker from "../components/TranslationPicker";
import { getDefaultTranslation } from "../utils/preferences";

export default function Search() {
  const [reference, setReference] = useState("");
  const [verseData, setVerseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [generatingSong, setGeneratingSong] = useState(false);
  const [songStatus, setSongStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string>('kjv');

  useEffect(() => {
    loadDefaultTranslation();
  }, []);

  const loadDefaultTranslation = async () => {
    try {
      const translation = await getDefaultTranslation();
      setSelectedTranslation(translation);
    } catch (error) {
      console.error("Error loading default translation:", error);
    }
  };

  const handleSearch = async () => {
    if (!reference.trim()) {
      setError("Please enter a verse reference");
      return;
    }

    setLoading(true);
    setError("");
    setVerseData(null);
    setIsSaved(false);

    try {
      const response = await bibleApi.getVerse(reference, selectedTranslation);
      if (response.success && response.data) {
        setVerseData(response.data);
      } else {
        setError(response.error?.message || "Failed to fetch verse");
      }
    } catch (err: any) {
      setError(err.message || "Network error - check backend is running");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!verseData) return;

    try {
      await verseStorage.saveVerse({
        reference: verseData.reference,
        text: verseData.text,
        translation: verseData.translation,
      });
      setIsSaved(true);
      Alert.alert("Saved!", "Verse saved successfully. Check the Home tab to see it.");
    } catch (err: any) {
      Alert.alert("Error", "Failed to save verse");
    }
  };

  const handleGenerateSong = async () => {
    if (!verseData) return;

    setGeneratingSong(true);
    setSongStatus("Starting generation...");
    setAudioUrl(null);

    try {
      // Step 1: Request song generation
      const generateResponse = await bibleApi.generateSong(
        verseData.text,
        verseData.reference
      );

      if (!generateResponse.success || !generateResponse.jobId) {
        throw new Error("Failed to start song generation");
      }

      // Step 2: Poll for completion
      setSongStatus("Generating song...");
      const url = await bibleApi.pollSongCompletion(
        generateResponse.jobId,
        (status) => {
          setSongStatus(`Status: ${status}`);
        }
      );

      // Step 3: Success!
      setAudioUrl(url);
      setSongStatus("Song ready!");
      Alert.alert(
        "Success!",
        "Your song is ready! You can now play it.",
        [{ text: "OK" }]
      );
    } catch (err: any) {
      console.error("Song generation error:", err);
      Alert.alert("Error", err.message || "Failed to generate song");
      setSongStatus("Generation failed");
    } finally {
      setGeneratingSong(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Verses</Text>
        <Text style={styles.subtitle}>Enter a Bible reference</Text>
      </View>

      <View style={styles.content}>
        <TranslationPicker
          selectedTranslation={selectedTranslation}
          onTranslationChange={setSelectedTranslation}
          label="Translation"
        />

        <TextInput
          style={styles.input}
          placeholder="e.g., John 3:16"
          value={reference}
          onChangeText={setReference}
          autoCapitalize="words"
          autoCorrect={false}
          onSubmitEditing={handleSearch}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Searching..." : "Search"}
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {verseData && (
          <ScrollView style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.reference}>{verseData.reference}</Text>
              <TouchableOpacity
                style={[styles.saveButton, isSaved && styles.savedButton]}
                onPress={handleSave}
                disabled={isSaved}
              >
                <Ionicons
                  name={isSaved ? "checkmark-circle" : "bookmark-outline"}
                  size={24}
                  color={isSaved ? "#4CAF50" : "#007AFF"}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.verseText}>{verseData.text}</Text>
            <Text style={styles.translation}>
              {verseData.translationName || verseData.translation.toUpperCase()}
            </Text>

            {/* Song Generation Section */}
            <View style={styles.songSection}>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  generatingSong && styles.generateButtonDisabled,
                ]}
                onPress={handleGenerateSong}
                disabled={generatingSong}
              >
                <Ionicons
                  name="musical-notes"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.generateButtonText}>
                  {generatingSong ? "Generating..." : "Generate Song"}
                </Text>
              </TouchableOpacity>

              {generatingSong && (
                <View style={styles.statusContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.statusText}>{songStatus}</Text>
                </View>
              )}

              {audioUrl && !generatingSong && (
                <View style={styles.audioContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.audioReadyText}>Song ready!</Text>
                  <Text style={styles.audioUrlText} numberOfLines={1}>
                    {audioUrl}
                  </Text>
                  <Text style={styles.noteText}>
                    Note: Audio playback coming in Phase 3
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fee",
    borderRadius: 8,
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    flex: 1,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reference: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  saveButton: {
    padding: 8,
  },
  savedButton: {
    opacity: 0.5,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 12,
  },
  translation: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  songSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  generateButton: {
    backgroundColor: "#FF9500",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonDisabled: {
    backgroundColor: "#ccc",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  audioContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    alignItems: "center",
  },
  audioReadyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: 8,
  },
  audioUrlText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  noteText: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
});
