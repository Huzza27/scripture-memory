import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";

interface SongPlayerProps {
  audioUri: string;
  reference: string;
  onClose: () => void;
}

export default function SongPlayer({ audioUri, reference, onClose }: SongPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadSound();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [audioUri]);

  const loadSound = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsLoaded(true);
      setIsPlaying(true);
    } catch (e) {
      console.error("Failed to load sound:", e);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis ?? 0);
    setDuration(status.durationMillis ?? 0);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const toggleLoop = async () => {
    if (!soundRef.current) return;
    const next = !isLooping;
    await soundRef.current.setIsLoopingAsync(next);
    setIsLooping(next);
  };

  const restart = async () => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(0);
    await soundRef.current.playAsync();
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View className="bg-[#f0f6ff] rounded-2xl p-4 mt-2 border border-[#cce0ff]">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-semibold text-[#007AFF]">{reference}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View className="flex-row h-1 rounded overflow-hidden mb-1">
        <View className="bg-[#007AFF]" style={{ flex: progress }} />
        <View className="bg-[#d0e4ff]" style={{ flex: 1 - progress }} />
      </View>

      <View className="flex-row justify-between mb-3">
        <Text className="text-[11px] text-[#888]">{formatTime(position)}</Text>
        <Text className="text-[11px] text-[#888]">{formatTime(duration)}</Text>
      </View>

      <View className="flex-row items-center justify-center gap-4">
        <TouchableOpacity onPress={toggleLoop} className="p-2">
          <Ionicons
            name="repeat"
            size={22}
            color={isLooping ? "#007AFF" : "#aaa"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={restart} className="p-2">
          <Ionicons name="play-skip-back" size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          className="w-[52px] h-[52px] rounded-full bg-[#007AFF] items-center justify-center"
          disabled={!isLoaded}
        >
          {!isLoaded ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
