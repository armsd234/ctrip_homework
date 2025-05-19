import React, { JSX, lazy, Suspense, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MultiImageUpload from '@/components/MultiImageUpload';
import { api } from '@/services/api';
// import LocationPicker from '@/components/Map';
import LocationPicker from '@/components/Map/LocationPicker.web';
// const LocationPicker = (Platform.select({
//   native: () => require('@/components/Map/LocationPicker.native').default,
//   web: () => require('@/components/Map/LocationPicker.web').default,
// }) || (() => null))();
// const LocationPicker = Platform.select({
//   native: () => require('../components/Map/LocationPicker.native').default as React.ComponentType<{onLocationSelected: (loc: any) => void}>,
//   web: () => require('../components/Map/LocationPicker.web').default as React.ComponentType<{onLocationSelected: (loc: any) => void}>,
// })?.() || (() => null);
// const LocationPicker = React.lazy(async () => {
//   try {
//     return Platform.OS === 'web' 
//       ? await import('../components/Map/LocationPicker.web')
//       : await import('../components/Map/LocationPicker.native');
//   } catch {
//     return { default: () => null };
//   }
// });


// const LocationPicker = Platform.select({
//   native: () => require('./LocationPicker').default, // 移动端加载真实组件
//   web: () => () => <UnimplementedView />, // Web 端返回空组件
// })();

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
  const [images, setImages] = useState<string[]>([]);
  const [when, setWhen] = useState('');
  const [days, setDays] = useState('');
  const [money, setMoney] = useState('');
  const [who, setWho] = useState('');

  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<LocationInfo | null>(null);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthOptions = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

  const [moneyUnit, setMoneyUnit] = useState('元');
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const companionOptions = ['家人', '朋友', '自己', '其他'];
  const [modalVisible, setModalVisible] = useState(false);
  const toggleMoneyUnit = () => {
    const units = ['元', '千元', '万元'];
    const nextUnit = units[units.indexOf(moneyUnit) + 1] || units[0];
    setMoneyUnit(nextUnit);
  };

  // 处理选择出行人
  const handleSelectCompanion = (option: React.SetStateAction<string>) => {
    setWho(option);
    setShowCompanionPicker(false);
  };

  // 处理选择月份
  const handleSelectMonth = (month: React.SetStateAction<string>) => {
    setWhen(month);
    setShowMonthPicker(false);
  };

  const handleLocationSelected = (locations: LocationInfo) => {
    setLocations(locations);
    setLocation(locations.address);
    setModalVisible(false);
  };

  // 提交游记
  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('提示', '标题和内容不能为空');
      return;
    }

    if (images.length === 0) {
      Alert.alert('提示', '至少上传 1 张图片');
      return;
    }

    const oldUnits = ['元', '千元', '万元'];
    const newUnits = ['', 'K', 'W'];
    const unit = newUnits[oldUnits.indexOf(moneyUnit)] || newUnits[0];
    const moneyValue = money === '' ? '' : money + unit;
    const whenValue = when === '' ? '' : when+'月';

    const noteData = { title, content, images, location, when: whenValue, days, money:moneyValue, who };
    console.log('发布内容：', noteData);

    try {
      const response = await api.post('/api/travel-notes/', noteData);
      if (response.status === 201) {
        alert('游记创建成功');
        router.push('/(tabs)/mydiary');
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
              setImages(filenames);
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
              <Ionicons name="location-outline" size={20} color="#333" />
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.formInput}
                  placeholder="添加地点或线路"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={location ? styles.addressText : styles.placeholderText}>
                      {location || '点击选择地址'}
                    </Text>
                  </TouchableOpacity>

                  <Suspense fallback={<Text>Loading</Text>}>
                    <Modal visible={modalVisible} animationType="slide">
                      <Suspense fallback={null}>
                      <LocationPicker onLocationSelected={handleLocationSelected} />
                      </Suspense>
                    </Modal>
                  </Suspense>
                </>
              )}
            </View>

            {/* 出发时间 */}
            <View style={styles.formItem}>
              <Ionicons name="calendar-outline" size={20} color="#333" />
              <Text style={styles.formText}>出发时间</Text>
              <TouchableOpacity
                style={[styles.formInput, { justifyContent: 'center' }]}
                onPress={() => setShowMonthPicker(true)}
              >
                <Text style={when ? { color: '#666' } : { color: '#999' }}>
                  {when || '请选择'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.formText}>月</Text>
            </View>

            {/* 出发天数 */}
            <View style={styles.formItem}>
              <Ionicons name="time-outline" size={20} color="#333" />
              <Text style={styles.formText}>出发天数</Text>
              <TextInput
                style={styles.formInput}
                placeholder="请输入数字"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={days}
                maxLength={3}
                // onChangeText={setdays}
                onChangeText={(text) => {
                  const filteredText = text.replace(/[^0-9]/g, ''); // 只允许输入数字
                  setDays(filteredText);
                }}
              />
              <Text style={styles.formText}>天</Text>
            </View>

            {/* 人均花费 */}
            <View style={styles.formItem}>
              <Ionicons name="cash-outline" size={20} color="#333" />
              <Text style={styles.formText}>人均花费</Text>
              <TextInput
                style={styles.formInput}
                placeholder={"请输入数字"}
                placeholderTextColor="#999"
                // keyboardType="numeric"
                value={money}
                maxLength={5}
                // onChangeText={setMoney}
                onChangeText={(text) => {
                  const filteredText = text.replace(/[^0-9.]/g, ''); // 允许数字和一个小数点
                  setMoney(filteredText);
                }}
                keyboardType="decimal-pad"  // 数字+小数点键盘
              />
              <TouchableOpacity onPress={toggleMoneyUnit}>
                <Text style={[styles.formText, { color: '#2c91ef' }]}>{moneyUnit}</Text>
              </TouchableOpacity>
            </View>

            {/* 和谁出行 */}
            <View style={styles.formItem}>
              <Ionicons name="people-outline" size={20} color="#333" />
              <Text style={styles.formText}>和谁出行</Text>
              <TouchableOpacity
                style={[styles.formInput, { justifyContent: 'center' }]}
                onPress={() => setShowCompanionPicker(true)}
              >
                <Text style={who ? { color: '#666' } : { color: '#999' }}>
                  {who || '请选择'}
                </Text>
              </TouchableOpacity>
            </View>


          </View>
        </View>


        {/* 和谁出行选择器 */}
        <Modal
          visible={showCompanionPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCompanionPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              {companionOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionButton}
                  onPress={() => handleSelectCompanion(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCompanionPicker(false)}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* 出发月份选择器 */}
        <Modal
          visible={showMonthPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <ScrollView>
                {monthOptions.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={styles.optionButton}
                    onPress={() => handleSelectMonth(month)}
                  >
                    <Text style={styles.optionText}>{month}月</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowMonthPicker(false)}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    // marginBottom: 12,
    // backgroundColor: 'pink',
    height: 40,
  },
  formText: {
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#333',
    marginLeft: 12,
  },
  formInput: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    // flex: 1,
    // backgroundColor: 'skyblue',
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
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  addressText: {
    color: '#000',
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    maxHeight: '50%',
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#555',
  },
});