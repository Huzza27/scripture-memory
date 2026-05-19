import { useState, useEffect } from "react";
import {
  View, Text, Modal, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator,
} from "react-native";
import { useTheme } from "../utils/theme";
import { SavedVerse } from "../utils/storage";
import { TRANSLATIONS } from "./TranslationPicker";
import bibleApi from "../api/bibleApi";

interface Props {
  verse: SavedVerse | null;
  onClose: () => void;
  onSave: (id: string, updates: { text: string; reference: string; translation: string }) => void;
}

export default function EditVerseSheet({ verse, onClose, onSave }: Props) {
  const theme = useTheme();

  const [text, setText] = useState("");
  const [reference, setReference] = useState("");
  const [translation, setTranslation] = useState("kjv");
  const [translationLoading, setTranslationLoading] = useState(false);

  useEffect(() => {
    if (verse) {
      setText(verse.text);
      setReference(verse.reference);
      setTranslation(verse.translation ?? "kjv");
    }
  }, [verse]);

  const handleTranslationChange = async (code: string) => {
    if (code === translation) return;
    setTranslation(code);
    setTranslationLoading(true);
    try {
      const resp = await bibleApi.getVerse(reference.trim(), code);
      if (resp.success && resp.data) {
        setText(resp.data.text.trim());
      }
    } catch {
      // keep existing text if fetch fails
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleSave = () => {
    if (!verse || !text.trim() || !reference.trim()) return;
    onSave(verse.id, { text: text.trim(), reference: reference.trim(), translation });
  };

  const canSave = !!text.trim() && !!reference.trim();

  return (
    <Modal visible={!!verse} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: theme.overlayLight }} activeOpacity={1} onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 rounded-t-[24px] p-6 pb-10" style={{ backgroundColor: theme.sheetBg }}>
        <View className="w-9 h-1 rounded-sm self-center mb-5" style={{ backgroundColor: theme.dragHandle }} />
        <Text className="text-lg font-bold mb-5" style={{ color: theme.text }}>Edit Verse</Text>

        <Text className="text-[13px] font-semibold uppercase tracking-[0.4px] mb-[6px]" style={{ color: theme.textTertiary }}>Reference</Text>
        <TextInput
          className="border-[1.5px] rounded-xl p-3 text-[15px] mb-4"
          style={{ borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background }}
          value={reference}
          onChangeText={setReference}
          placeholder="e.g. John 3:16"
          placeholderTextColor={theme.textTertiary}
          autoCapitalize="words"
        />

        <Text className="text-[13px] font-semibold uppercase tracking-[0.4px] mb-[6px]" style={{ color: theme.textTertiary }}>Verse Text</Text>
        <TextInput
          className="border-[1.5px] rounded-xl p-3 text-[15px] mb-4 h-[100px]"
          style={[
            { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.background, textAlignVertical: "top" },
            translationLoading && { opacity: 0.4 },
          ]}
          value={text}
          onChangeText={setText}
          placeholder="Verse text..."
          placeholderTextColor={theme.textTertiary}
          editable={!translationLoading}
          multiline
          autoCapitalize="sentences"
        />

        <View className="flex-row items-center gap-2 mb-[6px]">
          <Text className="text-[13px] font-semibold uppercase tracking-[0.4px]" style={{ color: theme.textTertiary }}>Translation</Text>
          {translationLoading && <ActivityIndicator size="small" color={theme.accent} />}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4, flexDirection: "row" }} className="mb-4">
          {TRANSLATIONS.map(t => (
            <TouchableOpacity
              key={t.code}
              className="px-3 py-[7px] rounded-full border"
              style={
                translation === t.code
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : { backgroundColor: theme.accentSurface, borderColor: theme.accent + "44" }
              }
              onPress={() => handleTranslationChange(t.code)}
              disabled={translationLoading}
            >
              <Text className="text-xs font-bold" style={{ color: translation === t.code ? "#fff" : theme.accentText }}>
                {t.code.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row gap-[10px]">
          <TouchableOpacity
            className="flex-1 border-[1.5px] rounded-xl p-[14px] items-center"
            style={{ borderColor: theme.borderStrong }}
            onPress={onClose}
          >
            <Text className="text-[15px] font-semibold" style={{ color: theme.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-xl p-[14px] items-center"
            style={{ backgroundColor: !canSave ? theme.borderDisabled : theme.accent }}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text className="text-white text-[15px] font-semibold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
