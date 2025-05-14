import { StyleSheet, View, ScrollView, Image, Pressable, FlatList, Dimensions, TextInput, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import { Ionicons } from '@expo/vector-icons';
import StatusTag from '@/components/StatusTag';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import MultiImageUpload from '@/components/MultiImageUpload';

const { width: screenWidth } = Dimensions.get('window');

type LocationInfo = {
  latitude: number;
  longitude: number;
  address: string;
};

export default function DiaryDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [diary, setDiary] = useState<TravelDiary | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFilenames, setImageFilenames] = useState<string[]>([]);
    const [date, setDate] = useState('');
    const [cost, setCost] = useState('');
    const [companions, setCompanions] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<LocationInfo | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchDiary = async () => {
            try {
                const response = await api.get(`/api/travel-notes/${id}`);
                if (response.data && response.data.data && response.data.data[0]) {
                    const diaryData = response.data.data[0];
                    setDiary(diaryData);
                    
                    // 设置表单初始值
                    setTitle(diaryData.title || '');
                    setContent(diaryData.content || '');
                    setImageFilenames(diaryData.coverImage || []);
                    setDate(diaryData.When || '');
                    setCost(diaryData.Money || '');
                    setCompanions(diaryData.Who || '');
                    setAddress(diaryData.location || '');
                }
            } catch (error) {
                console.error('获取游记详情失败:', error);
                Alert.alert('错误', '获取游记详情失败');
            }
        };

        fetchDiary();
    }, [id]);

    const handleLocationSelected = (location: LocationInfo) => {
        setLocation(location);
        setAddress(location.address);
        setModalVisible(false);
    };

    const handleSubmit = async () => {
        if (!title || !content) {
            Alert.alert('提示', '标题和内容不能为空');
            return;
        }

        if (imageFilenames.length === 0) {
            Alert.alert('提示', '至少上传 1 张图片');
            return;
        }

        try {
            const noteData = {
                title,
                content,
                images: imageFilenames,
                when: date,
                money: cost,
                who: companions,
                location: address
            };

            const response = await api.put(`/api/travel-notes/${id}`, noteData);
            if (response.status === 200) {
                Alert.alert('成功', '游记更新成功', [
                    { text: '确定', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error('更新失败:', error);
            Alert.alert('错误', '游记更新失败');
        }
    };

    if (!diary) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-outline" size={30} color="black" />
                </Pressable>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>未找到该游记</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-outline" size={30} color="black" />
                </Pressable>
                <Text style={styles.headerTitle}>编辑游记</Text>
            </View>

            <ScrollView>
                <View>
                    <MultiImageUpload
                        initialImages={imageFilenames.map(filename => 
                            `http://localhost:5001/api/images/image?filename=${filename}`
                        )}
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
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>

                        {/* 出发时间 */}
                        <View style={styles.formItem}>
                            <Ionicons name="calendar-outline" size={20} color="#555" />
                            <TextInput
                                style={styles.formInput}
                                placeholder="出发时间"
                                placeholderTextColor="#999"
                                value={date}
                                onChangeText={setDate}
                            />
                        </View>

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
                    <Text style={styles.publishText}>更新</Text>
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