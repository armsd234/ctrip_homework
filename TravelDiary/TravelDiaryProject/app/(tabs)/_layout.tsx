import React, { Suspense } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

// 加载中组件
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text>加载中...</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '游记列表',
            tabBarIcon: ({color}) => (
              <FontAwesome style={styles.icon} name="compass" color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="mydiary"
          options={{
            title: '我的游记',
            tabBarIcon: ({color}) => (
              <FontAwesome style={styles.icon} name="book" color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '我',
            tabBarIcon: ({color}) => (
              <FontAwesome style={styles.icon} name="user" color={color} />
            )
          }}
        />
      </Tabs>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    height: 52,
  },
  icon: {
    fontSize: 26,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
