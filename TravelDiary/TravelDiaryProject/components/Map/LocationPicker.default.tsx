import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

const LocationPicker: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.warning}>
        🌐 当前为 Web 平台，地图地址选择功能不可用。
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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