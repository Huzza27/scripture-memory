import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@app_preferences';

export interface AppPreferences {
  defaultTranslation: string;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  defaultTranslation: 'kjv',
};

/**
 * Get all app preferences
 */
export async function getPreferences(): Promise<AppPreferences> {
  try {
    const data = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (data) {
      const preferences = JSON.parse(data);
      return { ...DEFAULT_PREFERENCES, ...preferences };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Get default translation preference
 */
export async function getDefaultTranslation(): Promise<string> {
  const preferences = await getPreferences();
  return preferences.defaultTranslation;
}

/**
 * Set default translation preference
 */
export async function setDefaultTranslation(code: string): Promise<void> {
  try {
    const preferences = await getPreferences();
    preferences.defaultTranslation = code;
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving default translation:', error);
    throw error;
  }
}

/**
 * Clear all preferences (reset to defaults)
 */
export async function clearPreferences(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing preferences:', error);
    throw error;
  }
}
