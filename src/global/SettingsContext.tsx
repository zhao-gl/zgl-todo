import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface OverviewSettings {
  weekStartDay: 0 | 1; // 0=周日, 1=周一
  showPriority: boolean;
}

export interface CommonSettings {
  theme: 'light' | 'dark';
}

export interface AppSettings {
  overview: OverviewSettings;
  common: CommonSettings;
}

const DEFAULT_OVERVIEW: OverviewSettings = {
  weekStartDay: 0,
  showPriority: true,
};

const DEFAULT_COMMON: CommonSettings = {
  theme: 'light',
};

const DEFAULT_SETTINGS: AppSettings = {
  overview: DEFAULT_OVERVIEW,
  common: DEFAULT_COMMON,
};

interface SettingsContextType {
  settings: AppSettings;
  updateOverviewSettings: (partial: Partial<OverviewSettings>) => Promise<void>;
  updateCommonSettings: (partial: Partial<CommonSettings>) => Promise<void>;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateOverviewSettings: async () => {},
  updateCommonSettings: async () => {},
  loaded: false,
});

const getUserId = (): number | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || null;
  } catch {
    return null;
  }
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const userId = getUserId();

  // 从 DB 加载设置
  const loadFromDB = useCallback(async () => {
    if (!userId) {
      setLoaded(true);
      return;
    }
    try {
      const dbSettings = await window.electronAPI?.dbQuery('settings.getSettings', userId);
      if (dbSettings) {
        setSettings({
          overview: { ...DEFAULT_OVERVIEW, ...dbSettings.overview },
          common: { ...DEFAULT_COMMON, ...dbSettings.common },
        });
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  // 保存完整设置到 DB
  const saveToDB = useCallback(async (newSettings: AppSettings) => {
    if (!userId) return;
    try {
      await window.electronAPI?.dbQuery('settings.saveSettings', userId, newSettings);
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  }, [userId]);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  const updateOverviewSettings = useCallback(async (partial: Partial<OverviewSettings>) => {
    const newSettings = {
      ...settings,
      overview: { ...settings.overview, ...partial },
    };
    setSettings(newSettings);
    await saveToDB(newSettings);
  }, [settings, saveToDB]);

  const updateCommonSettings = useCallback(async (partial: Partial<CommonSettings>) => {
    const newSettings = {
      ...settings,
      common: { ...settings.common, ...partial },
    };
    setSettings(newSettings);
    await saveToDB(newSettings);
  }, [settings, saveToDB]);

  return (
    <SettingsContext.Provider value={{ settings, updateOverviewSettings, updateCommonSettings, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
