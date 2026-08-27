import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { palette } from "@/constants/theme";

interface TimePickerProps {
  /** Value as 24h "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  /** Minute step, defaults to 5. */
  step?: number;
}

function parse(value: string): { h: number; m: number } {
  const [h, m] = value.split(":").map(Number);
  return { h: h ?? 8, m: m ?? 0 };
}

function toISO(h: number, m: number): string {
  return `${String((h + 24) % 24).padStart(2, "0")}:${String((m + 60) % 60).padStart(2, "0")}`;
}

/**
 * A dependency-free hour/minute/AM-PM stepper. Native date pickers differ per
 * platform and don't render on web, so this keeps the UX identical everywhere.
 */
export function TimePicker({ value, onChange, step = 5 }: TimePickerProps) {
  const { h, m } = parse(value);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;

  const setHour12 = (next12: number) => {
    const norm = ((next12 - 1 + 12) % 12) + 1; // keep within 1..12
    const h24 = period === "PM" ? (norm % 12) + 12 : norm % 12;
    onChange(toISO(h24, m));
  };
  const setMinute = (nextM: number) => onChange(toISO(h, nextM));
  const togglePeriod = () => onChange(toISO((h + 12) % 24, m));

  const Stepper = ({
    label,
    onUp,
    onDown,
  }: {
    label: string;
    onUp: () => void;
    onDown: () => void;
  }) => (
    <View className="items-center">
      <Pressable onPress={onUp} className="rounded-full bg-white/10 p-1.5">
        <ChevronUp color={palette.textPrimary} size={18} />
      </Pressable>
      <Text className="my-1 w-14 text-center text-2xl font-bold text-white">{label}</Text>
      <Pressable onPress={onDown} className="rounded-full bg-white/10 p-1.5">
        <ChevronDown color={palette.textPrimary} size={18} />
      </Pressable>
    </View>
  );

  return (
    <View className="flex-row items-center justify-center gap-2 py-1">
      <Stepper
        label={String(h12)}
        onUp={() => setHour12(h12 + 1)}
        onDown={() => setHour12(h12 - 1)}
      />
      <Text className="text-2xl font-bold text-white">:</Text>
      <Stepper
        label={String(m).padStart(2, "0")}
        onUp={() => setMinute(m + step)}
        onDown={() => setMinute(m - step)}
      />
      <Pressable
        onPress={togglePeriod}
        className="ml-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
      >
        <Text className="text-lg font-bold text-saffron-300">{period}</Text>
      </Pressable>
    </View>
  );
}
