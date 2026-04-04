import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const TAB_HEIGHT = 60;
const CENTER_BTN_SIZE = 64;
const CENTER_BTN_OFFSET = 20;

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const tabBarHeight = TAB_HEIGHT + bottomInset;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} colors={colors} bottomInset={bottomInset} tabBarHeight={tabBarHeight} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="feed"
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="dienstplan" options={{ title: "Dienstplan" }} />
      <Tabs.Screen name="zeiterfassung" options={{ title: "Zeiterfassung" }} />
      <Tabs.Screen name="tausch" options={{ title: "Tausch" }} />
      <Tabs.Screen name="mehr" options={{ title: "Mehr" }} />
    </Tabs>
  );
}

function CustomTabBar({
  state,
  navigation,
  colors,
  bottomInset,
  tabBarHeight,
}: any) {
  const routes = state.routes.filter((r: any) => r.name !== "index");
  const currentRouteName = state.routes[state.index]?.name;

  const getIcon = (name: string, focused: boolean, index: number) => {
    const color = focused ? colors.tabActive : colors.tabInactive;
    const icons: Record<string, string> = {
      feed: "rss",
      dienstplan: "calendar",
      zeiterfassung: "clock",
      tausch: "repeat",
      mehr: "menu",
    };
    const iconName = icons[name] ?? "circle";

    if (index === 2) return null;
    return <Feather name={iconName as any} size={22} color={color} />;
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: tabBarHeight,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {routes.map((route: any, index: number) => {
        const focused = route.name === currentRouteName;
        const isCenter = index === 2;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <View key={route.key} style={styles.centerTabWrapper}>
              <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={[
                  styles.centerButton,
                  {
                    backgroundColor: focused
                      ? colors.primary
                      : colors.tabBar,
                    borderColor: focused ? colors.primary : colors.border,
                    width: CENTER_BTN_SIZE,
                    height: CENTER_BTN_SIZE,
                    borderRadius: CENTER_BTN_SIZE / 2,
                    bottom: CENTER_BTN_OFFSET + bottomInset,
                  },
                ]}
              >
                <Feather
                  name="clock"
                  size={26}
                  color={focused ? colors.primaryForeground : colors.primary}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.centerLabel,
                  {
                    color: focused ? colors.tabActive : colors.tabInactive,
                    fontFamily: focused
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  },
                ]}
              >
                Zeit
              </Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tab}
          >
            {getIcon(route.name, focused, index)}
            <Text
              style={[
                styles.label,
                {
                  color: focused ? colors.tabActive : colors.tabInactive,
                  fontFamily: focused
                    ? "Inter_600SemiBold"
                    : "Inter_400Regular",
                },
              ]}
              numberOfLines={1}
            >
              {route.name === "dienstplan"
                ? "Dienst"
                : route.name === "mehr"
                ? "Mehr"
                : route.name === "feed"
                ? "Feed"
                : "Tausch"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 8,
  },
  label: {
    fontSize: 10,
  },
  centerTabWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 6,
    gap: 0,
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#E89F3F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    position: "absolute",
  },
  centerLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
