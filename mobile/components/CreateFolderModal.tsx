import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { FOLDER_COLORS } from "../utils/storage";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export default function CreateFolderModal({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[4]);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color);
    setName("");
    setColor(FOLDER_COLORS[4]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>New Folder</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Folder name"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        <Text style={styles.colorLabel}>Color</Text>
        <View style={styles.swatches}>
          {FOLDER_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchSelected]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!name.trim()}
          >
            <Text style={styles.createText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1.5, borderColor: "#ddd", borderRadius: 12,
    padding: 12, fontSize: 16, marginBottom: 20,
  },
  colorLabel: { fontSize: 13, fontWeight: "600", color: "#888", marginBottom: 10 },
  swatches: { flexDirection: "row", gap: 10, marginBottom: 24 },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  swatchSelected: { borderWidth: 3, borderColor: "#000" },
  actions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: "#ddd",
    borderRadius: 12, padding: 14, alignItems: "center",
  },
  cancelText: { color: "#555", fontSize: 15, fontWeight: "600" },
  createBtn: { flex: 1, backgroundColor: "#007AFF", borderRadius: 12, padding: 14, alignItems: "center" },
  createBtnDisabled: { backgroundColor: "#ccc" },
  createText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
