import { useEffect, useRef } from "react";
import { View, Text, Animated, PanResponder, Vibration } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import { usePreferences } from "../context/PreferencesContext";
import { SavedVerse, VerseProgress } from "../utils/storage";
import { getTranslationName } from "./TranslationPicker";
import StageBar from "./StageBar";

export interface VerseCardProps {
  item: SavedVerse;
  progress?: VerseProgress | null;
  onTap: () => void;
  onDragStart: (item: SavedVerse, pageX: number, pageY: number) => void;
  onDragMove: (pageX: number, pageY: number) => void;
  onDragEnd: (item: SavedVerse) => void;
  onDragCancel: () => void;
  isDragging: boolean;
}

export default function VerseCard({ item, progress, onTap, onDragStart, onDragMove, onDragEnd, onDragCancel, isDragging }: VerseCardProps) {
  const theme = useTheme();
  const { prefs } = usePreferences();

  // Always-fresh callback refs (avoid stale closure in PanResponder)
  const cb = useRef({ onTap, onDragStart, onDragMove, onDragEnd, onDragCancel });
  useEffect(() => { cb.current = { onTap, onDragStart, onDragMove, onDragEnd, onDragCancel }; });

  const isActiveDrag = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initPos = useRef({ x: 0, y: 0 });
  const pressScale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
        const { pageX, pageY } = evt.nativeEvent;
        initPos.current = { x: pageX, y: pageY };
        longPressTimer.current = setTimeout(() => {
          isActiveDrag.current = true;
          Vibration.vibrate(40);
          Animated.spring(pressScale, { toValue: 1.04, useNativeDriver: true, speed: 60, bounciness: 0 }).start(() => {
            cb.current.onDragStart(item, pageX, pageY);
          });
        }, 500);
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        if (!isActiveDrag.current) {
          const dx = Math.abs(pageX - initPos.current.x);
          const dy = Math.abs(pageY - initPos.current.y);
          if (dx > 8 || dy > 8) {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
          }
          return;
        }
        cb.current.onDragMove(pageX, pageY);
      },
      onPanResponderRelease: () => {
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (!isActiveDrag.current) {
          cb.current.onTap();
        } else {
          cb.current.onDragEnd(item);
        }
        isActiveDrag.current = false;
      },
      onPanResponderTerminate: () => {
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (isActiveDrag.current) cb.current.onDragCancel();
        isActiveDrag.current = false;
      },
    })
  ).current;

  const today = new Date().toISOString().split('T')[0];
  const isDue = !!(progress?.nextReview && progress.nextReview <= today);

  return (
    <Animated.View
      className="rounded-xl p-4 mb-3 flex-row items-center"
      style={[
        { backgroundColor: theme.surface },
        isDragging && { opacity: 0.35 },
        { transform: [{ scale: pressScale }] },
      ]}
      {...panResponder.panHandlers}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-[6px] gap-2">
          <Text className="text-base font-bold" style={{ color: theme.text }}>{item.reference}</Text>
          {item.songUri && (
            <View className="rounded-[10px] px-[6px] py-[2px]" style={{ backgroundColor: theme.accentSurfaceAlt }}>
              <Ionicons name="musical-notes" size={11} color="#007AFF" />
            </View>
          )}
          <StageBar progress={progress} isDue={isDue} />
        </View>
        {prefs.hideVerseText
          ? <Text className="text-[13px] italic mb-[5px]" style={{ color: theme.textMuted, lineHeight: 19 }}>Text hidden</Text>
          : <Text className="text-[13px] mb-[5px]" style={{ color: theme.textSecondary, lineHeight: 19 }} numberOfLines={2}>{item.text}</Text>
        }
        <Text className="text-[11px] italic" style={{ color: theme.textMuted }}>{getTranslationName(item.translation)}</Text>
      </View>
      <Ionicons name={isDragging ? "move-outline" : "chevron-forward"} size={16} color={theme.borderDisabled} />
    </Animated.View>
  );
}
