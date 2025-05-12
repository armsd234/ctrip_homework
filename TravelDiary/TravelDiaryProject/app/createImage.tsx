import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MultiImageUpload from '@/components/MultiImageUpload';
import { api } from '@/services/api';

export default function TravelPublishScreen() {
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFilenames, setImageFilenames] = useState<string[]>([]);


  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cost, setCost] = useState('');
  const [companions, setCompanions] = useState('');


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
              <TextInput
                style={styles.formInput}
                placeholder="添加地点或线路"
                placeholderTextColor="#999"
                value={location}
                onChangeText={setLocation}
              />
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
});