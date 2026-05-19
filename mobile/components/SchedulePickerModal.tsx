import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "../utils/theme";

const DAY_LABELS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function getScheduleLabel(schedule: number[] | undefined): string {
  if (!schedule || schedule.length === 0) return "No schedule";
  const sorted = [...schedule].sort((a, b) => a - b);
  if (sorted.length === 7) return "Every day";
  if (sorted.join() === WEEKDAYS.join()) return "Weekdays";
  if (sorted.join() === WEEKENDS.join()) return "Weekends";
  return sorted.map(d => DAY_LABELS[d]).join(" · ");
}

interface Props {
  visible: boolean;
  schedule: number[] | undefined;
  onClose: () => void;
  onSave: (schedule: number[]) => void;
}

export default function SchedulePickerModal({ visible, schedule, onClose, onSave }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState<number[]>(schedule ?? []);

  useEffect(() => {
    if (visible) setSelected(schedule ?? []);
  }, [visible, schedule]);

  const toggleDay = (day: number) => {
    setSelected(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const applyPreset = (days: number[]) => setSelected(days);

  const handleSave = () => {
    onSave([...selected].sort((a, b) => a - b));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity className="absolute inset-0" style={{ backgroundColor: theme.overlay }} activeOpacity={1} onPress={onClose} />
      <View className="absolute bottom-0 left-0 right-0 rounded-t-[24px] p-6 pb-11" style={{ backgroundColor: theme.sheetBg }}>
        <View className="w-9 h-1 rounded-sm self-center mb-5" style={{ backgroundColor: theme.dragHandle }} />
        <Text className="text-lg font-bold mb-1" style={{ color: theme.text }}>Practice Schedule</Text>
        <Text className="text-[13px] mb-5" style={{ color: theme.textTertiary }}>Choose which days to practice this verse</Text>

        {/* Presets */}
        <View className="flex-row gap-2 mb-5">
          {[
            { label: "Every day", days: ALL_DAYS },
            { label: "Weekdays",  days: WEEKDAYS },
            { label: "Weekends",  days: WEEKENDS },
          ].map(({ label, days }) => {
            const active = [...selected].sort((a,b)=>a-b).join() === [...days].sort((a,b)=>a-b).join();
            return (
              <TouchableOpacity
                key={label}
                className="flex-1 border-[1.5px] rounded-[10px] py-2 items-center"
                style={active
                  ? { borderColor: theme.accent, backgroundColor: theme.accentSurface }
                  : { borderColor: theme.border }
                }
                onPress={() => applyPreset(days)}
              >
                <Text className="text-xs font-semibold" style={{ color: active ? theme.accent : theme.textSecondary }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Day toggles */}
        <View className="flex-row justify-between mb-7">
          {DAY_LABELS.map((label, i) => {
            const on = selected.includes(i);
            return (
              <TouchableOpacity
                key={i}
                className="w-10 h-10 rounded-full border-[1.5px] items-center justify-center"
                style={on
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : { borderColor: theme.border }
                }
                onPress={() => toggleDay(i)}
              >
                <Text className="text-xs font-bold" style={{ color: on ? "#fff" : theme.textSecondary }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions */}
        <View className="flex-row gap-[10px]">
          <TouchableOpacity
            className="flex-1 border-[1.5px] rounded-xl p-[14px] items-center"
            style={{ borderColor: theme.border }}
            onPress={() => { onSave([]); onClose(); }}
          >
            <Text className="text-[15px] font-semibold" style={{ color: theme.textSecondary }}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-xl p-[14px] items-center"
            style={[
              { flex: 2, backgroundColor: theme.accent },
              selected.length === 0 && { backgroundColor: theme.borderDisabled },
            ]}
            onPress={handleSave}
            disabled={selected.length === 0}
          >
            <Text className="text-white text-[15px] font-bold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
