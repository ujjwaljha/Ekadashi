import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { palette } from "@/constants/theme";

/** Back control for stack screens that hide the native header. */
export function StackBack({ fallback = "/(tabs)/settings" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace(fallback as never);
      }}
      className="mb-4 flex-row items-center gap-1 self-start rounded-full bg-white/10 px-3 py-1.5"
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <ChevronLeft color={palette.saffronLight} size={16} />
      <Text className="text-sm font-semibold text-saffron-200">Back</Text>
    </Pressable>
  );
}
