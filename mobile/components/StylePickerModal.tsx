import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const STYLES = [
  { key: "gentle worship", label: "Gentle Worship", icon: "heart-outline", description: "Soft, reverent, melodic" },
  { key: "hymn", label: "Hymn", description: "Traditional church hymn style", icon: "book-outline" },
  { key: "upbeat", label: "Upbeat", description: "Energetic, joyful, memorable", icon: "flash-outline" },
  { key: "chant", label: "Chant", description: "Rhythmic, repetitive, meditative", icon: "musical-note-outline" },
] as const;

export type SongStyle = typeof STYLES[number]["key"];

interface StylePickerModalProps {
  visible: boolean;
  onSelect: (style: SongStyle) => void;
  onClose: () => void;
}

export default function StylePickerModal({ visible, onSelect, onClose }: StylePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Song Style</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {STYLES.map((s) => (
          <TouchableOpacity key={s.key} style={styles.option} onPress={() => onSelect(s.key)}>
            <View style={styles.iconWrap}>
              <Ionicons name={s.icon} size={22} color="#007AFF" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{s.label}</Text>
              <Text style={styles.optionDesc}>{s.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  optionDesc: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
});
