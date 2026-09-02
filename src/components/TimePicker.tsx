import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/motion";
import { fonts, palette } from "@/constants/theme";

interface TimePickerProps {
  /** Value as 24h "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  /** Minute step, defaults to 5. */
  step?: number;
}

function parse(value: string): { h: number; m: number } {
  const [h, m] = value.split(":").map(Number);
  return { h: Number.isFinite(h) ? h : 8, m: Number.isFinite(m) ? m : 0 };
}

function toISO(h: number, m: number): string {
  return `${String(((h % 24) + 24) % 24).padStart(2, "0")}:${String(((m % 60) + 60) % 60).padStart(2, "0")}`;
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
    const norm = ((next12 - 1 + 12) % 12) + 1;
    const h24 = period === "PM" ? (norm % 12) + 12 : norm % 12;
    onChange(toISO(h24, m));
  };

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
      <PressableScale
        onPress={onUp}
        haptic="selection"
        className="rounded-full bg-white/10 p-2"
        accessibilityRole="button"
      >
        <ChevronUp color={palette.textPrimary} size={18} />
      </PressableScale>
      <Text
        style={{ fontFamily: fonts.display }}
        className="my-1 w-14 text-center text-3xl text-white"
      >
        {label}
      </Text>
      <PressableScale
        onPress={onDown}
        haptic="selection"
        className="rounded-full bg-white/10 p-2"
        accessibilityRole="button"
      >
        <ChevronDown color={palette.textPrimary} size={18} />
      </PressableScale>
    </View>
  );

  return (
    <View className="flex-row items-center justify-center gap-2 py-1">
      <Stepper label={String(h12)} onUp={() => setHour12(h12 + 1)} onDown={() => setHour12(h12 - 1)} />
      <Text style={{ fontFamily: fonts.display }} className="text-3xl text-white">
        :
      </Text>
      <Stepper
        label={String(m).padStart(2, "0")}
        onUp={() => onChange(toISO(h, m + step))}
        onDown={() => onChange(toISO(h, m - step))}
      />
      <PressableScale
        onPress={() => onChange(toISO((h + 12) % 24, m))}
        haptic="selection"
        className="ml-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
        accessibilityRole="button"
        accessibilityLabel="Toggle AM PM"
      >
        <Text style={{ fontFamily: fonts.sansBold }} className="text-lg text-saffron-300">
          {period}
        </Text>
      </PressableScale>
    </View>
  );
}
