import { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
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
    <View className="flex-1 bg-white">
      <View className="pt-16 px-5 pb-5 bg-[#f9f9f9] border-b border-[#eee]">
        <Text className="text-3xl font-bold mb-1">Search Verses</Text>
        <Text className="text-sm text-[#666]">Enter a Bible reference</Text>
      </View>

      <View className="p-5 flex-1">
        <TranslationPicker
          selectedTranslation={selectedTranslation}
          onTranslationChange={setSelectedTranslation}
          label="Translation"
        />

        <TextInput
          className="border border-[#ddd] rounded-lg p-3 text-base mb-4"
          placeholder="e.g., John 3:16"
          value={reference}
          onChangeText={setReference}
          autoCapitalize="words"
          autoCorrect={false}
          onSubmitEditing={handleSearch}
        />

        <TouchableOpacity
          className="bg-[#007AFF] p-4 rounded-lg items-center"
          onPress={handleSearch}
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Searching..." : "Search"}
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#007AFF" className="mt-5" />}

        {error && (
          <View className="mt-5 p-4 bg-[#fee] rounded-lg">
            <Text className="text-[#c00] text-sm">{error}</Text>
          </View>
        )}

        {verseData && (
          <ScrollView className="mt-6 p-4 bg-[#f9f9f9] rounded-xl flex-1">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-[#333] flex-1">{verseData.reference}</Text>
              <TouchableOpacity
                className={`p-2${isSaved ? " opacity-50" : ""}`}
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
            <Text className="text-base leading-6 text-[#333] mb-3">{verseData.text}</Text>
            <Text className="text-xs text-[#666] italic">
              {verseData.translationName || verseData.translation.toUpperCase()}
            </Text>

            {/* Song Generation Section */}
            <View className="mt-6 pt-6 border-t border-[#ddd]">
              <TouchableOpacity
                className={`p-4 rounded-lg flex-row items-center justify-center${generatingSong ? " bg-[#ccc]" : " bg-[#FF9500]"}`}
                onPress={handleGenerateSong}
                disabled={generatingSong}
              >
                <Ionicons
                  name="musical-notes"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-base font-semibold">
                  {generatingSong ? "Generating..." : "Generate Song"}
                </Text>
              </TouchableOpacity>

              {generatingSong && (
                <View className="mt-4 flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text className="text-sm text-[#666]">{songStatus}</Text>
                </View>
              )}

              {audioUrl && !generatingSong && (
                <View className="mt-4 p-4 bg-[#e8f5e9] rounded-lg items-center">
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text className="text-base font-semibold text-[#4CAF50] mt-2">Song ready!</Text>
                  <Text className="text-xs text-[#666] mt-2" numberOfLines={1}>
                    {audioUrl}
                  </Text>
                  <Text className="text-[11px] text-[#999] mt-2 italic">
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
