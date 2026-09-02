import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";

import { fonts, palette } from "@/constants/theme";

export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
      <Search color={palette.textMuted} size={16} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={accessibilityLabel}
        className="ml-2 flex-1 py-1 text-base text-white"
        style={{ fontFamily: fonts.sans }}
      />
    </View>
  );
}
