import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { isAuthenticated } from '../services/auth';

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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const isCheckingAuth = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      if (isCheckingAuth.current) return;
      try {
        isCheckingAuth.current = true;
        const currentPath = segments.length > 0 ? segments[0] : '';
        const isAuthPage = ['login', 'register'].includes(currentPath as string);
        const authenticated = await isAuthenticated();

        if (isMounted) {
          if (authenticated && isAuthPage) {
            router.replace('/(tabs)');
          } else {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('认证检查出错:', error);
      } finally {
        isCheckingAuth.current = false;
      }
    };

    // checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, segments]);

  return (
    <Stack screenOptions={{ 
      headerShown: false
     }}>
      
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="diary/[id]" />
      <Stack.Screen name="diary-list/[id]" />
    </Stack>
  );
}
