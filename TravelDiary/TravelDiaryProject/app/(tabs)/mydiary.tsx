import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import StatusFilter from '@/components/StatusFilter';
import DiaryCard from '@/components/DiaryCard';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '@/components/Themed';
import React from 'react';

export default function MyDiaryScreen() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [diaries, setDiaries] = useState<TravelDiary[]>([]);
  const router = useRouter();
  const { isAuthenticated, checkToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 修改 loadAllData 函数，初始化过滤后的数据
  const loadAllData = async () => {
    if (!user?.user._id) return;
    
    setLoading(true);
    setError(null);
    try {
      const userId = user.user._id;
      const response = await api.get(`/api/travel-notes/user/${userId}`);
      
      // 确保响应数据符合预期格式
      if (response.data && response.data.data) {
        const travelsData = response.data.data.map((note: any) => ({
          id: note._id || note.id,
          title: note.title || '',
          content: note.content || '',
          coverImage: `http://localhost:5001/api/images/image?filename=${note.images[0]? note.images[0] :' default_avatar.jpg'}`,
          video: `http://localhost:5001/api/images/video?filename=${note.video}` || '',
          duration: note.duration || '00:00:00',
          type: note.video ? 'video' : 'image',
          tags: note.tags || [],
          When: note.when || '',
          Who: note.who || '',
          Days: note.days || '',
          Money: note.money || '',
          user: {
            id: note.author?._id || 'unknown',
            nickname: note.author?.nickname || '未知用户',
            avatar: `http://localhost:5001/api/images/image?filename=${note.author?.avatar}` || 'http://localhost:5001/api/images/image?filename=default_avatar.jpg'
          },
          likes: note.likes || 0,
          collects: note.favoriteCount || 0,
          comments: note.commentCount || 0,
          views: note.views || 0,
          location: note.location || '',
          createTime: note.createdAt || new Date(),
          status: note.status || 'pending'
        }));
        
        setDiaries(travelsData);
        console.log('游记数据:', travelsData);
      } else {
        setError('数据格式错误');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      await checkToken();
      setIsReady(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push({
        pathname: '/authscreen',
        params: { from: '/(tabs)/profile' }
      });
    } else if (user?.user._id) {
      loadAllData();
    }
  }, [isReady, isAuthenticated]);

  // 根据状态筛选游记
  const filteredDiaries = diaries.filter(diary => 
    selectedStatus === 'all' || diary.status === selectedStatus
  );

  const handlePressDiary = (diary: TravelDiary) => {
    router.push({
      pathname: '/diary/[id]',
      params: { id: diary.id }
    });
  };

  const handleEditDiary = (diary: TravelDiary) => {
    if(diary.type==='image'){
      router.push({
      pathname: '/diary-edit/[id]',
      params: { id: diary.id }
    });
    }else{
      router.push({
        pathname: '/diary-edit-video/[id]',
      params: { id: diary.id }
      });
    }
    
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      const response = await api.delete(`/api/travel-notes/${id}`);
      
      if (response.status === 200) {
        alert('游记已删除');
        // 重新加载数据
        loadAllData();
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('游记删除失败');
    }
  };

  // 添加刷新回调函数
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllData();
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.user._id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAllData}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusFilter 
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        <ScrollView 
          style={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']} // Android
              tintColor="#007AFF" // iOS
              title="下拉刷新" // iOS
              titleColor="#999999" // iOS
            />
          }
        >
          {filteredDiaries.length > 0 ? (
            filteredDiaries.map(diary => (
              <View key={diary.id}>
                <DiaryCard
                  diary={diary}
                  onPress={() => handlePressDiary(diary)}
                  onEdit={() => handleEditDiary(diary)}
                  onDelete={() => handleDeleteDiary(diary.id)}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无游记</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

