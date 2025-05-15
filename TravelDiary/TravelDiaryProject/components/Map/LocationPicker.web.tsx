import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

const LocationPicker: React.FC<Props> = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Pressable onPress={() => router.back()}>
        <Ionicons name="chevron-back-outline" size={30} color="black" />
      </Pressable>
      <View style={styles.container}>
        <Text style={styles.warning}>
          🌐 当前为 Web 平台，地图地址选择功能不可用。
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 60
  },
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default LocationPicker;