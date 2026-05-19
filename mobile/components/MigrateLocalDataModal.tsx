import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '../utils/theme';
import { verseStorage, folderStorage, progressStorage } from '../utils/storage';
import bibleApi from '../api/bibleApi';

interface Props {
  visible: boolean;
  onDone: () => void;
}

export default function MigrateLocalDataModal({ visible, onDone }: Props) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setLoading(true);
    try {
      const [verses, folders, progress] = await Promise.all([
        verseStorage.getSavedVerses(),
        folderStorage.getFolders(),
        progressStorage.getAll(),
      ]);

      if (verses.length > 0) await bibleApi.syncBulkVerses(verses as unknown as Record<string, unknown>[]);
      if (folders.length > 0) await bibleApi.syncBulkFolders(folders as unknown as Record<string, unknown>[]);

      for (const [verseId, prog] of Object.entries(progress)) {
        await bibleApi.syncUpsertProgress(verseId, prog as unknown as Record<string, unknown>);
      }
    } catch (err) {
      console.error('Migration error:', err);
    } finally {
      setLoading(false);
      onDone();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center p-7" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View className="rounded-2xl p-6 gap-4" style={{ backgroundColor: theme.surface }}>
          <Text className="text-xl font-bold" style={{ color: theme.text }}>Import local data?</Text>
          <Text className="text-[15px]" style={{ color: theme.textSecondary, lineHeight: 22 }}>
            You have verses saved on this device. Would you like to import them into your new account so they sync across devices?
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-[14px] rounded-xl border items-center"
              style={{ borderColor: theme.border }}
              onPress={onDone}
              disabled={loading}
            >
              <Text className="font-semibold text-[15px]" style={{ color: theme.textSecondary }}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-[14px] rounded-xl items-center"
              style={{ backgroundColor: theme.accent }}
              onPress={handleImport}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text className="text-white font-bold text-[15px]">Import</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
