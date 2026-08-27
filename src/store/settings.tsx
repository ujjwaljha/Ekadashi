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

import type { LeadDay, Settings } from "@/types";

const STORAGE_KEY = "ekadashi.settings.v1";

export const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: true,
  leadDays: [0, 1],
  reminderTime: "08:00",
  alarmEnabled: false,
  alarmSound: "temple-bell",
  timezone: "device",
};

interface SettingsContextValue {
  settings: Settings;
  /** True until the persisted settings have been read from storage. */
  hydrated: boolean;
  update: (patch: Partial<Settings>) => void;
  toggleLeadDay: (day: LeadDay) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Merge persisted data over defaults so new fields always have a value. */
function normalize(raw: unknown): Settings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const parsed = raw as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    leadDays: Array.isArray(parsed.leadDays)
      ? ([...new Set(parsed.leadDays)].filter((d) => d >= 0 && d <= 4) as LeadDay[])
      : DEFAULT_SETTINGS.leadDays,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  // Avoid writing back to storage during the initial hydration pass.
  const canPersist = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setSettings(normalize(JSON.parse(stored)));
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

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

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
