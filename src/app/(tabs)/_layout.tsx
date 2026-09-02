import { Tabs } from "expo-router";
import { CalendarDays, LayoutDashboard, Settings } from "lucide-react-native";

import { fonts, palette, tabBarStyle } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.saffron,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.sansSemi, fontWeight: "600" },
        tabBarItemStyle: { paddingTop: 2 },
        sceneStyle: { backgroundColor: palette.inkDeep },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
