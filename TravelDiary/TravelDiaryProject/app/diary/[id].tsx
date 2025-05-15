import { StyleSheet, View, ScrollView, Image, Pressable, FlatList, Dimensions } from 'react-native';
import { Text } from '@/components/Themed';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import { Ionicons } from '@expo/vector-icons';
import StatusTag from '@/components/StatusTag';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState, useEffect } from 'react';
import { api } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

interface ProcessedDiary extends TravelDiary {
  coverImage: string[];
  user: {
    id: string;
    avatar: string;
    nickname: string;
  };
}

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [diary, setDiary] = useState<ProcessedDiary | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const response = await api.get(`/api/travel-notes/${id}`);
        if (response.data && response.data.data && response.data.data[0]) {
          const diaryData = response.data.data[0];
          console.log('diaryData',diaryData);
          // 转换后端数据格式为前端需要的格式
          const processedDiary: ProcessedDiary = {
            ...diaryData,
            coverImage: Array.isArray(diaryData.coverImage) 
              ? diaryData.coverImage.map((img: string) => `http://localhost:5001/api/images/image?filename=${img}`)
              : [`http://localhost:5001/api/images/image?filename=${diaryData.coverImage}`],
            user: {
              id: diaryData.user.id,
              avatar: `http://localhost:5001/api/images/image?filename=${diaryData.user.avatar}`,
              nickname: diaryData.user.nickname
            }
          };
          setDiary(processedDiary);
          console.log('processedDiary',processedDiary);
        }
      } catch (error) {
        console.error('获取游记详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </Pressable>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diary) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </Pressable>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>加载中</Text>
          <Link href="/" style={styles.link}>
            <Text style={styles.linkText}>点击回到上一页面</Text>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentImageIndex(index);
  };

  const handleEditDiary = (diary: ProcessedDiary) => {
    router.push({
      pathname: '/diary-edit/[id]',
      params: { id: diary.id }
    });
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      const response = await api.delete(`/api/travel-notes/${id}`);
      if (response.status === 200) {
        alert('游记已删除');
        router.push('/mydiary');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('游记删除失败');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={30} color="black" />
          </Pressable>
          <View style={styles.authorContainer}>
            <Image source={{ uri: diary.user.avatar }} style={styles.avatar} />
            <Text style={styles.nickname}>{diary.user.nickname}</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollArea}>
          <View>
            <View>
              <FlatList
                data={diary.coverImage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: screenWidth, height: 300 }}
                  />
                )}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ref={flatListRef}
              />
              {diary.coverImage.length > 1 && (
                <View style={styles.indicatorContainer}>
                  {diary.coverImage.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicatorDot,
                        currentImageIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {!!(diary.When) && (
              <View style={styles.infoBox}>
                <Text style={styles.infoItem}>出发时间{"\n"}<Text style={styles.infoBold}>{diary.When}</Text></Text>
                <Text style={styles.infoItem}>行程天数{"\n"}<Text style={styles.infoBold}>{diary.Days}</Text></Text>
                <Text style={styles.infoItem}>人均花费{"\n"}<Text style={styles.infoBold}>{diary.Money}</Text></Text>
                <Text style={styles.infoItem}>和谁出行{"\n"}<Text style={styles.infoBold}>{diary.Who}</Text></Text>
              </View>
            )}

            <View style={styles.contentContainer}>
              <Text style={styles.title}>{diary.title}</Text>
              <Text style={styles.content}>{diary.content}</Text>
              <View style={styles.otherInfo}>
                <Text style={styles.time}>{new Date(diary.createTime).toLocaleDateString()}</Text>
                <Text style={styles.location}>{diary.location}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleEditDiary(diary)}
            >
              <Ionicons name="create-outline" size={20} color="#2196F3" />
              <Text style={styles.actionText}>编辑</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteDiary(diary.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
              <Text style={[styles.actionText, styles.deleteText]}>删除</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    // marginBottom: 60
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollArea: {
    flex: 1,
    // backgroundColor: 'white',
    marginBottom: 60
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  authorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nickname: {
    height: 40,
    lineHeight: 40,
    fontSize: 20,
    fontWeight: '600',
    // marginBottom: 4,
  },
  authorInfo: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#333',
    width: 10,
    height: 10,
  },
  otherInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  time: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: '#999',
    // marginBottom: 16,
  },
  rejectionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4d4f',
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 4,
  },
  deleteText: {
    color: '#F44336',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f3f7ff',
    margin: 12,
    borderRadius: 10,
    paddingVertical: 10,
  },
  infoItem: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  infoBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
}); 