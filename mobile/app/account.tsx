import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import { useAuth } from "../context/AuthContext";
import ScreenHeader from "../components/ScreenHeader";
import bibleApi from "../api/bibleApi";
import { verseStorage, progressStorage } from "../utils/storage";

type Section = "view" | "editProfile" | "changePassword";

export default function AccountScreen() {
  const theme = useTheme();
  const { user, logout, updateProfile } = useAuth();

  const [section, setSection] = useState<Section>("view");

  // Stats
  const [verseCount, setVerseCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  // Edit profile
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");  // bio may be undefined on old cached sessions
  const [profileSaving, setProfileSaving] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [verses, progress] = await Promise.all([
      verseStorage.getSavedVerses(),
      progressStorage.getAll(),
    ]);
    setVerseCount(verses.length);
    setMasteredCount(Object.values(progress).filter(p => p.mastered).length);
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) { Alert.alert("Error", "Username cannot be empty."); return; }
    if (bio.length > 500) { Alert.alert("Error", "Bio must be 500 characters or fewer."); return; }
    setProfileSaving(true);
    try {
      await updateProfile(username.trim(), bio.trim());
      setSection("view");
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { Alert.alert("Error", "All fields are required."); return; }
    if (newPassword.length < 4) { Alert.alert("Error", "New password must be at least 4 characters."); return; }
    if (newPassword !== confirmPassword) { Alert.alert("Error", "New passwords don't match."); return; }
    setPasswordSaving(true);
    try {
      await bibleApi.changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setSection("view");
      Alert.alert("Success", "Password changed.");
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  // ── View ───────────────────────────────────────────────────────────────────

  if (section === "editProfile") {
    return (
      <KeyboardAvoidingView className="flex-1" style={{ backgroundColor: theme.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScreenHeader title="Edit Profile" subtitle="Update your info" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text className="text-sm font-semibold uppercase tracking-wide mt-4 mb-1.5" style={{ color: theme.textTertiary }}>Username</Text>
          <TextInput
            className="rounded-xl p-3.5 text-base border"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your_username"
            placeholderTextColor={theme.textTertiary}
          />

          <Text className="text-sm font-semibold uppercase tracking-wide mt-4 mb-1.5" style={{ color: theme.textTertiary }}>Bio</Text>
          <TextInput
            className="rounded-xl p-3.5 text-base border"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 100, textAlignVertical: "top" }}
            value={bio}
            onChangeText={setBio}
            placeholder="A short bio..."
            placeholderTextColor={theme.textTertiary}
            multiline
            autoCapitalize="sentences"
            maxLength={500}
          />
          <Text className="text-xs text-right mt-1" style={{ color: theme.textMuted }}>{bio.length}/500</Text>

          <View className="flex-row gap-2.5 mt-6">
            <TouchableOpacity
              className="flex-1 rounded-xl p-3.5 items-center border"
              style={{ borderWidth: 1.5, borderColor: theme.borderStrong }}
              onPress={() => { setUsername(user?.username ?? ""); setBio(user?.bio ?? ""); setSection("view"); }}
            >
              <Text className="text-base font-semibold" style={{ color: theme.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl p-3.5 items-center${profileSaving ? " opacity-60" : ""}`}
              style={{ backgroundColor: theme.accent }}
              onPress={handleSaveProfile}
              disabled={profileSaving}
            >
              {profileSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-base font-bold text-white">Save</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (section === "changePassword") {
    return (
      <KeyboardAvoidingView className="flex-1" style={{ backgroundColor: theme.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScreenHeader title="Change Password" subtitle="Keep your account secure" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text className="text-sm font-semibold uppercase tracking-wide mt-4 mb-1.5" style={{ color: theme.textTertiary }}>Current Password</Text>
          <TextInput
            className="rounded-xl p-3.5 text-base border"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showPasswords}
            placeholder="Current password"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="none"
          />

          <Text className="text-sm font-semibold uppercase tracking-wide mt-4 mb-1.5" style={{ color: theme.textTertiary }}>New Password</Text>
          <TextInput
            className="rounded-xl p-3.5 text-base border"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPasswords}
            placeholder="At least 4 characters"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="none"
          />

          <Text className="text-sm font-semibold uppercase tracking-wide mt-4 mb-1.5" style={{ color: theme.textTertiary }}>Confirm New Password</Text>
          <TextInput
            className="rounded-xl p-3.5 text-base border"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPasswords}
            placeholder="Repeat new password"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="none"
          />

          <TouchableOpacity className="flex-row items-center gap-2 mt-3" onPress={() => setShowPasswords(v => !v)}>
            <Ionicons name={showPasswords ? "eye-off-outline" : "eye-outline"} size={18} color={theme.textTertiary} />
            <Text className="text-sm" style={{ color: theme.textTertiary }}>{showPasswords ? "Hide passwords" : "Show passwords"}</Text>
          </TouchableOpacity>

          <View className="flex-row gap-2.5 mt-6">
            <TouchableOpacity
              className="flex-1 rounded-xl p-3.5 items-center border"
              style={{ borderWidth: 1.5, borderColor: theme.borderStrong }}
              onPress={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setSection("view"); }}
            >
              <Text className="text-base font-semibold" style={{ color: theme.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl p-3.5 items-center${passwordSaving ? " opacity-60" : ""}`}
              style={{ backgroundColor: theme.accent }}
              onPress={handleChangePassword}
              disabled={passwordSaving}
            >
              {passwordSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-base font-bold text-white">Update</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Profile view ───────────────────────────────────────────────────────────

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Account" subtitle="Your profile" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Avatar + name */}
        <View className="items-center mb-5 pt-2">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: theme.accent }}
          >
            <Text className="text-3xl font-extrabold text-white">{(user?.username ?? "?")[0].toUpperCase()}</Text>
          </View>
          <Text className="text-2xl font-bold mb-1" style={{ color: theme.text }}>{user?.username}</Text>
          <Text className="text-sm mb-1" style={{ color: theme.textTertiary }}>{user?.email}</Text>
          {joinedDate && <Text className="text-xs" style={{ color: theme.textMuted }}>Joined {joinedDate}</Text>}
        </View>

        {/* Bio */}
        {user?.bio ? (
          <View
            className="rounded-xl p-3.5 mb-4 border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <Text className="text-sm leading-5" style={{ color: theme.textSecondary }}>{user.bio}</Text>
          </View>
        ) : (
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-xl p-3.5 mb-4 border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, borderStyle: "dashed" }}
            onPress={() => setSection("editProfile")}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.textTertiary} />
            <Text className="text-sm italic" style={{ color: theme.textTertiary }}>Add a bio...</Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View className="flex-row gap-2.5 mb-6">
          <View
            className="flex-1 rounded-xl p-3.5 items-center border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <Text className="text-2xl font-extrabold mb-0.5" style={{ color: theme.text }}>{verseCount}</Text>
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Verses</Text>
          </View>
          <View
            className="flex-1 rounded-xl p-3.5 items-center border"
            style={{ backgroundColor: theme.accentSurface, borderColor: theme.accent + "44" }}
          >
            <Text className="text-2xl font-extrabold mb-0.5" style={{ color: theme.text }}>{masteredCount}</Text>
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Mastered</Text>
          </View>
          <View
            className="flex-1 rounded-xl p-3.5 items-center border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <Text className="text-2xl font-extrabold mb-0.5" style={{ color: theme.text }}>{verseCount > 0 ? Math.round((masteredCount / verseCount) * 100) : 0}%</Text>
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textTertiary }}>Complete</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-2">
          <TouchableOpacity
            className="flex-row items-center gap-3 rounded-xl p-3.5 border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            onPress={() => { setUsername(user?.username ?? ""); setBio(user?.bio ?? ""); setSection("editProfile"); }}
          >
            <View
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: theme.accentSurfaceAlt }}
            >
              <Ionicons name="person-outline" size={20} color={theme.accent} />
            </View>
            <Text className="flex-1 text-base font-semibold" style={{ color: theme.text }}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.borderDisabled} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 rounded-xl p-3.5 border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            onPress={() => setSection("changePassword")}
          >
            <View
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: theme.accentSurfaceAlt }}
            >
              <Ionicons name="lock-closed-outline" size={20} color={theme.accent} />
            </View>
            <Text className="flex-1 text-base font-semibold" style={{ color: theme.text }}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.borderDisabled} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-3 rounded-xl p-3.5 border"
            style={{ backgroundColor: theme.redText + "08", borderColor: theme.redText + "22" }}
            onPress={handleLogout}
          >
            <View
              className="w-9 h-9 rounded-lg items-center justify-center"
              style={{ backgroundColor: theme.redText + "18" }}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.redText} />
            </View>
            <Text className="flex-1 text-base font-semibold" style={{ color: theme.redText }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
