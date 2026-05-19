import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getPreferences, AppPreferences, DEFAULT_PREFERENCES } from "../utils/preferences";

interface PreferencesContextValue {
  prefs: AppPreferences;
  refresh: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  prefs: DEFAULT_PREFERENCES,
  refresh: async () => {},
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFERENCES);

  const refresh = async () => {
    const loaded = await getPreferences();
    setPrefs(loaded);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <PreferencesContext.Provider value={{ prefs, refresh }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);
