import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#f5f5f5",
            },
            headerTintColor: "#333",
            headerTitleStyle: {
              fontWeight: "600",
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: "Meerly Finance",
              headerShown: false,
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
