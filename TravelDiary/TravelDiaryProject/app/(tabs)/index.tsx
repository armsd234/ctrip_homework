import { StyleSheet, TextInput, TouchableOpacity, View,Image, RefreshControl } from 'react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Text } from '@/components/Themed';
import TravelDiaryMasonry from '@/components/TravelDiaryMasonry';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '@/services/api';

const PAGE_SIZE = 10;

interface BackendResponse {
  data: {
    _id: string;
    title: string;
    content: string;
    images: string[];
    author: {
      _id: string;
      nickname: string;
      avatar: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    video?: string;
    duration?: number;
    location?: string;
    when?: string;
    days?: string;
    money?: string;
    who?: string;
    tags?: Array<{
      _id: string;
      name: string;
      image: string;
      suggestion?: string;
      url: string;
    }>;
    views?: number;
    commentCount?: number;
    likesCount?: number;
    favoriteCount?: number;
    rejectReason?: string;
  }[];
  total: number;
  page: number;
  limit: number;
}

// 转换后端数据为前端TravelDiary格式
const convertToTravelDiaries = (responseData: BackendResponse): TravelDiary[] => {
  if (!responseData?.data || !Array.isArray(responseData.data)) {
    return [];
  }

  return responseData.data.map(item => ({
    id: item._id,
    title: item.title || '',
    content: item.content || '',
    coverImage: item.images?.map(image => 
      `http://localhost:5001/api/images/image?filename=${image}`
    ) || [],
    video: item.video ? `http://localhost:5001/api/images/video?filename=${item.video}` : undefined,
    duration: item.duration || 0,
    type: item.video ? 'video' : 'image',
    tags: item.tags?.map(tag => ({
      name: tag.name || '',
      image: tag.image || '',
      suggestion: tag.suggestion || '',
      url: tag.url || ''
    })) || [],
    When: item.when || '',
    Who: item.who || '',
    Days: item.days || '',
    Money: item.money || '',
    user: {
      id: item.author._id,
      nickname: item.author.nickname || '未知用户',
      avatar: `http://localhost:5001/api/images/image?filename=${item.author.avatar}`
    },
    likes: item.likesCount || 0,
    collects: item.favoriteCount || 0,
    comments: item.commentCount || 0,
    views: item.views || 0,
    location: item.location || '',
    createTime: item.createdAt || new Date().toISOString(),
    status: item.status || 'pending',
    rejectReason: item.rejectReason
  }));
};

export default function TabOneScreen() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [diaries, setDiaries] = useState<TravelDiary[]>([]);
  const [filteredDiaries, setFilteredDiaries] = useState<TravelDiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated, checkToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [avatar, setavatar] = useState("https://picsum.photos/100/100?random=1");
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 初始加载数据
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/travel-notes/`, { 
        params: { 
          page: 1, 
          limit: PAGE_SIZE,
          status: 'approved'
        } 
      });
      const travelsData = convertToTravelDiaries(response.data);
      setDiaries(travelsData);
      setFilteredDiaries(travelsData);
      setPage(2);
      setHasMore(travelsData.length === PAGE_SIZE);
    } catch (error) {
      console.error('获取初始数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载更多数据
  const loadMoreData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/travel-notes/`, { 
        params: { 
          page, 
          limit: PAGE_SIZE,
          status: 'approved'
        } 
      });
      const newData = convertToTravelDiaries(response.data);
      setHasMore(newData.length === PAGE_SIZE);
      
      setDiaries(prev => {
        const existingIds = new Set(prev.map(d => d.id));
        const uniqueNewData = newData.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewData];
      });
      
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('获取更多数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      await checkToken();
      setIsReady(true);
    };
    checkAuth();
    if (user?.user._id) {
      setavatar(`http://localhost:5001/api/images/image?filename=${user?.user.avatar}`);
    }
    if (isReady && !isAuthenticated) {
      router.push({
        pathname: '/authscreen',
        params: { from: '/(tabs)/profile' }
      });
    }
  }, [isReady, isAuthenticated]);

  useEffect(() => {
    setFilteredDiaries(diaries);
  }, [diaries]);

  const handleLoadMore = useCallback(() => {
    loadMoreData();
  }, [loading, page, hasMore]);

  // 跳转详情
  const handlePressItem = (diary: TravelDiary) => {
    router.push(`/diary-list/${diary.id}`);
  };

  const debouncedSearch = useMemo(
    () => debounce(async (text: string) => {
      if (!text.trim()) {
        setFilteredDiaries(diaries);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/api/travel-notes/`, { 
          params: { 
            page: 1,
            limit: PAGE_SIZE,
            search: text,
            status: 'approved'
          } 
        });
        const searchResults = convertToTravelDiaries(response.data);
        setFilteredDiaries(searchResults);
      } catch (error) {
        console.error('搜索失败:', error);
        setFilteredDiaries([]);
      }
    }, 500),
    [diaries]
  );

  // 输入变化处理
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  // 组件卸载时清除防抖函数
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // 添加滚动处理函数
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20; // 添加一些底部padding，提前触发
    const isScrolledToBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    setIsAtBottom(isScrolledToBottom);
  }, []);

  // 下拉刷新处理函数
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 重置页码
      setPage(1);
      // 重新加载第一页数据
      const response = await api.get(`/api/travel-notes/`, { 
        params: { 
          page: 1, 
          limit: PAGE_SIZE,
          status: 'approved'
        } 
      });
      const travelsData = convertToTravelDiaries(response.data);
      setDiaries(travelsData);
      setFilteredDiaries(travelsData);
      setHasMore(travelsData.length === PAGE_SIZE);
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>用一篇游记，看遍世界。</Text>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索游记..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>
        
        {isSearching && filteredDiaries.length === 0 ? (
          <View style={styles.emptyResult}>
            <Text style={styles.emptyText}>没有找到相关游记</Text>
          </View>
        ) : (
          <>
            <TravelDiaryMasonry
              diaries={filteredDiaries}
              loading={loading}
              searching={isSearching}
              onLoadMore={handleLoadMore}
              onPressItem={handlePressItem}
              onScroll={handleScroll}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2196F3']} // Android
                  tintColor="#2196F3" // iOS
                />
              }
            />
            {!hasMore && isAtBottom && (
              <View style={styles.noMoreContainer}>
                <Text style={styles.noMoreText}>没有更多了哦</Text>
              </View>
            )}
          </>
        )}
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
  },
  noMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 14,
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
  }, emptyResult: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  carousel: {
    height: 180,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
});
