import React from 'react';
import { View, Text } from 'react-native';
export default function EditProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>编辑个人资料页面</Text>
    </View>
  );
}
// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Alert,
//   Button,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
// // @ts-ignore
// import coordtransform from 'coordtransform';
// // import coordtransform from 'coordtransform';

// type LocationInfo = {
//   latitude: number;
//   longitude: number;
//   address: string;
// };

// type Props = {
//   onLocationSelected: (location: LocationInfo) => void;
// };

// const getAddressFromCoords = async (lat: number, lon: number): Promise<string> => {
//   try {
//     const res = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
//     );
//     const data = await res.json();
//     const addr = data.address;

//     const preferred =
//       addr.university ||
//       addr.college ||
//       addr.school ||
//       addr.building ||
//       addr.attraction ||
//       addr.theatre ||
//       addr.museum ||
//       addr.stadium ||
//       addr.amenity ||
//       addr.place;

//     if (preferred) return preferred;

//     const parts = [
//       addr.road,
//       addr.neighbourhood,
//       addr.suburb,
//       addr.city || addr.town || addr.village,
//     ].filter(Boolean);

//     return parts.slice(0, 2).join(', ') || '未知地址';
//   } catch (e) {
//     console.error(e);
//     return '地址获取失败';
//   }
// };

// const getCoordsFromAddress = async (query: string): Promise<{ lat: number; lon: number } | null> => {
//   try {
//     const res = await fetch(
//       `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
//     );
//     const data = await res.json();
//     if (data.length > 0) {
//       const wgsLat = parseFloat(data[0].lat);
//       const wgsLon = parseFloat(data[0].lon);

//       // 转换为 GCJ-02 坐标
//       const [gcjLon, gcjLat] = coordtransform.wgs84togcj02(wgsLon, wgsLat);
//       console.log(`WGS-84: ${wgsLat}, ${wgsLon} -> GCJ-02: ${gcjLat}, ${gcjLon}`);
      
//       return { lat: gcjLat, lon: gcjLon };
//     }
//     return null;
//   } catch (e) {
//     console.error(e);
//     return null;
//   }
// };

// const LocationPicker: React.FC<Props> = ({ onLocationSelected }) => {
//   const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [address, setAddress] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const mapRef = useRef<MapView>(null);

//   const handleMapPress = async (e: MapPressEvent) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     setMarker({ latitude, longitude });
//     const addr = await getAddressFromCoords(latitude, longitude);
//     setAddress(addr);
//     onLocationSelected({ latitude, longitude, address: addr });
//   };

//   const handleSearch = async () => {
//     if (!searchQuery) return;
//     const coords = await getCoordsFromAddress(searchQuery);
//     if (!coords) {
//       Alert.alert('未找到地址', '请尝试更具体的地址');
//       return;
//     }

//     const region: Region = {
//       latitude: coords.lat,
//       longitude: coords.lon,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     };

//     mapRef.current?.animateToRegion(region);
//     setMarker({ latitude: coords.lat, longitude: coords.lon });

//     const addr = await getAddressFromCoords(coords.lat, coords.lon);
//     setAddress(addr);
//     onLocationSelected({ latitude: coords.lat, longitude: coords.lon, address: addr });
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ marginTop:80, flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <View style={styles.container}>
//         <TextInput
//           style={styles.input}
//           placeholder="搜索地址，例如 南京邮电大学"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         <Button title="搜索地址" onPress={handleSearch} />

//         <MapView
//           style={styles.map}
//           ref={mapRef}
//           initialRegion={{
//             latitude: 32.1152,
//             longitude: 118.9259,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//           onPress={handleMapPress}
//         >
//           {marker && <Marker coordinate={marker} />}
//         </MapView>

//         <TextInput
//           style={styles.addressDisplay}
//           value={address}
//           editable={false}
//           placeholder="点击地图或搜索后将显示地址"
//         />
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default LocationPicker;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 6,
//     paddingHorizontal: 10,
//     marginBottom: 5,
//     height: 40,
//   },
//   map: {
//     flex: 1,
//     minHeight: 300,
//     marginVertical: 10,
//   },
//   addressDisplay: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 10,
//     marginTop: 5,
//   },
// });