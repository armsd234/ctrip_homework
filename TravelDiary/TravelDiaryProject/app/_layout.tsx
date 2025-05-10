import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect} from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    let isMounted = true;

    return () => {
      isMounted = false;
    };
  }, [router, segments]);

  return (
    <Stack screenOptions={{ 
      headerShown: false
     }}>
       <Stack.Screen
        name="editinfo" // 文件名 (不带扩展名)
        options={{
          animation: 'slide_from_right', // Android (Material)
          // animation: 'slide_from_left', // iOS (Card)
          // animation: 'default', // Platform default
          animationDuration: 1000 // 设置动画时长为 1000 毫秒，可按需调整
        }}
      />
      <Stack.Screen 
        name="authscreen"
        options={{ 
          animation: 'slide_from_bottom',
          animationDuration: 1000 // 设置动画时长为 1000 毫秒，可按需调整
        }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="diary/[id]" />
      <Stack.Screen name="diary-list/[id]" />
    </Stack>
  );
}
