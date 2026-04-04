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
const CENTER_BTN_SIZE = 60;
const CENTER_LIFT = 14;

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const tabBarHeight = TAB_HEIGHT + bottomInset;

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          colors={colors}
          bottomInset={bottomInset}
          tabBarHeight={tabBarHeight}
        />
      )}
      screenOptions={{ headerShown: false }}
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

  const ICONS: Record<string, string> = {
    feed: "rss",
    dienstplan: "calendar",
    tausch: "repeat",
    mehr: "menu",
  };

  const LABELS: Record<string, string> = {
    feed: "Feed",
    dienstplan: "Dienstplan",
    tausch: "Tausch",
    mehr: "Mehr",
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
            <View key={route.key} style={styles.centerWrapper}>
              <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={[
                  styles.centerButton,
                  {
                    width: CENTER_BTN_SIZE,
                    height: CENTER_BTN_SIZE,
                    borderRadius: CENTER_BTN_SIZE / 2,
                    backgroundColor: colors.primary,
                    marginTop: -CENTER_LIFT,
                  },
                ]}
              >
                <Feather
                  name="clock"
                  size={26}
                  color={colors.primaryForeground}
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
                Zeiterfassung
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
            <Feather
              name={ICONS[route.name] as any}
              size={22}
              color={focused ? colors.tabActive : colors.tabInactive}
            />
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
              {LABELS[route.name] ?? route.name}
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
    alignItems: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "visible",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
    gap: 4,
  },
  label: {
    fontSize: 10,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    gap: 4,
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E89F3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 10,
  },
});
