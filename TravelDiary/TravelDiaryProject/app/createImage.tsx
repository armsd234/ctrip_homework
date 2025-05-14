import React, { JSX, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MultiImageUpload from '@/components/MultiImageUpload';
import { api } from '@/services/api';
// import LocationPicker from '@/components/Map/LocationPicker.native';
// import LocationPicker from '@/components/Map/LocationPicker.web';

// let LocationPicker:any;

// if (Platform.OS === 'web') {
//   LocationPicker = require('@/components/Map/LocationPicker.web').default;
//   console.log('尝试加载 web 组件');
  
// } else {
//   console.log('尝试加载原生组件');
  
  // 移动端尝试加载原生组件，失败后回退默认组件
  // try {
    // LocationPicker = require('@/components/Map/LocationPicker.native').default;
  // } catch (e) {
    // LocationPicker = require('@/components/Map/LocationPicker.default').default;
  // }
// }

// const [Picker, setPicker] = useState(() => () => null);

  // useEffect(() => {
  //   const loadPicker = async () => {
  //     if (Platform.OS === 'web') {
  //       LocationPicker = require('@/components/Map/LocationPicker.web').default;

  //     } else {
  //       try {
  //           // LocationPicker = require('@/components/Map/LocationPicker.native').default;
  //       } catch (e) {
  //           LocationPicker = require('@/components/Map/LocationPicker.default').default;
  //       }
  //     }
  //   };
  //   loadPicker();
  // }, []);


// export default LocationPicker;

type LocationInfo = {
  latitude: number;
  longitude: number;
  address: string;
};

export default function TravelPublishScreen() {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFilenames, setImageFilenames] = useState<string[]>([]);


  // const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cost, setCost] = useState('');
  const [companions, setCompanions] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLocationSelected = (location: LocationInfo) => {
    setLocation(location);
    setAddress(location.address);
    setModalVisible(false);
  };


  // 提交游记
  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('提示', '标题和内容不能为空');
      return;
    }

    if (imageFilenames.length === 0) {
      Alert.alert('提示', '至少上传 1 张图片');
      return;
    }

    const noteData = { title, content, images: imageFilenames, location, date, cost, companions };
    console.log('发布内容：', noteData);

    try {
      const response = await api.post('/api/travel-notes/', noteData);
      if (response.status === 201) {
        alert('游记创建成功');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('游记创建失败');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>发布图文游记</Text>
      </View>

      <ScrollView>
        <View>
          <MultiImageUpload
            onUploadSuccess={(filenames) => {
              setImageFilenames(filenames);
              console.log('上传成功:', filenames);
              Alert.alert('提示', `已上传 ${filenames.length} 张图片`);
            }}
            onUploadError={(error) => {
              Alert.alert('上传失败', error.message);
            }}
          />
          <View style={styles.conentContainer}>


            {/* 标题 */}
            <TextInput
              style={styles.inputTitle}
              placeholder="添加标题"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            {/* 正文内容 */}
            <TextInput
              style={styles.inputContent}
              placeholder="记录你的旅行故事..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
            />

            {/* 地点 */}
            <View style={styles.formItem}>
              <Ionicons name="location-outline" size={20} color="#555" />
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.formInput}
                  placeholder="添加地点或线路"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={address ? styles.addressText : styles.placeholderText}>
                      {address || '点击选择地址'}
                    </Text>
                  </TouchableOpacity>

                  <Modal visible={modalVisible} animationType="slide">
                    <LocationPicker onLocationSelected={handleLocationSelected} />
                  </Modal>
                </>
              )}
            </View>

            {/* 出发时间 */}
            <Pressable style={styles.formItem} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.formInput}>
                出发日期：{date.toLocaleDateString()}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            {/* 人均花费 */}
            <View style={styles.formItem}>
              <Ionicons name="cash-outline" size={20} color="#555" />
              <TextInput
                style={styles.formInput}
                placeholder="人均花费（元）"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={cost}
                onChangeText={setCost}
              />
            </View>

            {/* 出行人 */}
            <View style={styles.formItem}>
              <Ionicons name="people-outline" size={20} color="#555" />
              <TextInput
                style={styles.formInput}
                placeholder="和谁出行（如：朋友、家人、独自等）"
                placeholderTextColor="#999"
                value={companions}
                onChangeText={setCompanions}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.draftBtn}>
          <Ionicons name="document-text-outline" size={18} color="666" />
          <Text style={{ color: '#666', marginLeft: 4 }}>存草稿</Text>
        </Pressable>

        <Pressable style={styles.publishMainBtn} onPress={handleSubmit}>
          <Text style={styles.publishText}>发布</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },

  publishButton: {
    color: '#007bff',
    fontSize: 16,
  },
  conentContainer: {
    paddingLeft: 20,
    paddingRight: 20
  },
  imageUploadSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
    marginBottom: 12,
  },
  inputContent: {
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginBottom: 16,
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formInput: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishMainBtn: {
    backgroundColor: '#2c91ef',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginLeft: 16,
  },
  publishText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  touchable: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  addressText: {
    color: '#000',
  },
  placeholderText: {
    color: '#aaa',
  },
});