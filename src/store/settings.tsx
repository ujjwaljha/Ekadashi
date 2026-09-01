import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_SETTINGS, STORAGE_KEY, normalizeSettings } from "@/store/defaults";
import type { LeadDay, Settings } from "@/types";

export { DEFAULT_SETTINGS, normalizeSettings } from "@/store/defaults";

interface SettingsContextValue {
  settings: Settings;
  /** True once persisted settings have been read from storage. */
  hydrated: boolean;
  update: (patch: Partial<Settings>) => void;
  toggleLeadDay: (day: LeadDay) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const canPersist = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setSettings(normalizeSettings(JSON.parse(stored)));
      } catch (err) {
        console.warn("[settings] failed to load", err);
      } finally {
        canPersist.current = true;
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!canPersist.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch((err) =>
      console.warn("[settings] failed to save", err)
    );
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleLeadDay = useCallback((day: LeadDay) => {
    setSettings((prev) => {
      const has = prev.leadDays.includes(day);
      const leadDays = (
        has ? prev.leadDays.filter((d) => d !== day) : [...prev.leadDays, day]
      ).sort((a, b) => a - b) as LeadDay[];
      return { ...prev, leadDays };
    });
  }, []);

  const reset = useCallback(
    () =>
      setSettings((prev) => ({
        ...DEFAULT_SETTINGS,
        onboardingCompleted: prev.onboardingCompleted,
      })),
    []
  );

  const value = useMemo(
    () => ({ settings, hydrated, update, toggleLeadDay, reset }),
    [settings, hydrated, update, toggleLeadDay, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
