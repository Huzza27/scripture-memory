import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{reference}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={[styles.progressEmpty, { flex: 1 - progress }]} />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleLoop} style={styles.controlBtn}>
          <Ionicons
            name="repeat"
            size={22}
            color={isLooping ? "#007AFF" : "#aaa"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={restart} style={styles.controlBtn}>
          <Ionicons name="play-skip-back" size={22} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn} disabled={!isLoaded}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f6ff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#cce0ff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  progressBar: {
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    backgroundColor: "#007AFF",
  },
  progressEmpty: {
    backgroundColor: "#d0e4ff",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  time: {
    fontSize: 11,
    color: "#888",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  controlBtn: {
    padding: 8,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
