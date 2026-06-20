import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim() || (mode === 'register' && !username.trim())) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, username.trim());
      }
      router.replace('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert(mode === 'login' ? 'Login Failed' : 'Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1" style={{ backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }} keyboardShouldPersistTaps="handled">
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold mb-1.5" style={{ color: theme.text }}>Scripture Memory</Text>
          <Text className="text-base" style={{ color: theme.textSecondary }}>{mode === 'login' ? 'Sign in to your account' : 'Create an account'}</Text>
        </View>

        <View className="gap-4">
          {mode === 'register' && (
            <View className="gap-1.5">
              <Text className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Username</Text>
              <TextInput
                className="rounded-xl border text-base"
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 14 }}
                placeholder="your_name"
                placeholderTextColor={theme.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View className="gap-1.5">
            <Text className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Email</Text>
            <TextInput
              className="rounded-xl border text-base"
              style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 14 }}
              placeholder="you@example.com"
              placeholderTextColor={theme.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-semibold" style={{ color: theme.textSecondary }}>Password</Text>
            <TextInput
              className="rounded-xl border text-base"
              style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 14 }}
              placeholder={mode === 'register' ? 'At least 8 characters' : 'Password'}
              placeholderTextColor={theme.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="rounded-xl py-4 items-center mt-2"
            style={{ backgroundColor: theme.accent }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-base font-bold text-white">{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-3" onPress={() => setMode(m => m === 'login' ? 'register' : 'login')}>
            <Text className="text-sm" style={{ color: theme.accent }}>
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
