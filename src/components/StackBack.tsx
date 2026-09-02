import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Text } from "react-native";

import { PressableScale } from "@/components/motion";
import { fonts, palette } from "@/constants/theme";

/** Back control for stack screens that hide the native header. */
export function StackBack({ fallback = "/(tabs)/settings" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <PressableScale
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace(fallback as never);
      }}
      className="mb-4 flex-row items-center gap-1 self-start rounded-full bg-white/10 px-3 py-1.5"
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <ChevronLeft color={palette.saffronLight} size={16} />
      <Text style={{ fontFamily: fonts.sansSemi }} className="text-sm text-saffron-200">
        Back
      </Text>
    </PressableScale>
  );
}
