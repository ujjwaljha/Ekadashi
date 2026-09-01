import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found", headerShown: true }} />
      <View className="flex-1 items-center justify-center bg-indigoink-950 px-6">
        <Text className="text-lg font-semibold text-white">This screen does not exist.</Text>
        <Link href="/" className="mt-3 text-saffron-300">
          Go to dashboard
        </Link>
      </View>
    </>
  );
}
