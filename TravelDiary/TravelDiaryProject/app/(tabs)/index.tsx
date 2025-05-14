import { StyleSheet, TextInput, TouchableOpacity, View,Image } from 'react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Text } from '@/components/Themed';
import TravelDiaryMasonry from '@/components/TravelDiaryMasonry';
import { TravelDiary, Tag } from '@/components/TravelDiaryMasonry/types';
import travelDiaries from '@/data/travelDiaries.json';
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

  // diaries 游记数据、loading 加载状态、page 当前页码
  const [searchText, setSearchText] = useState('');
  const [diaries, setDiaries] = useState<TravelDiary[]>(travelDiaries.diaries as unknown as TravelDiary[]);
  const [filteredDiaries, setFilteredDiaries] = useState<TravelDiary[]>([]);
  // const [diariestrue, setDiariestrue] = useState<TravelDiary[]>([]);
  const [filteredDiariestrue, setFilteredDiariestrue] = useState<TravelDiary[]>([]);
  const [MoreData, setMoreData] = useState<TravelDiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageture, setPageture] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreTrue, setHasMoreTrue] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated, checkToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [avatar, setavatar] = useState("https://picsum.photos/100/100?random=1");
  // const avatar = "https://picsum.photos/100/100?random=1";
  

  const loadData = async () => {
    setLoading(true);
    try {
      const travelsRes = await api.get(`/api/travel-notes/`, { params: { page: 1, limit: 10 ,status:'approved'} });
      const travelsData = convertToTravelDiaries(travelsRes.data);
      console.log('loadData travelsData:', travelsData);
      setFilteredDiariestrue(travelsData);
      setPageture(pageture + 1);
      setHasMoreTrue(travelsData.length===10);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载更多数据
  const loadMoreData = async () => {
    if (loading || !hasMoreTrue) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/travel-notes/`, { params: { page: pageture, limit: 10 ,status:'approved'} });
      const newData = convertToTravelDiaries(response.data);
      
      setHasMoreTrue(newData.length === 10);
      console.log(hasMoreTrue)
      setMoreData(newData);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredDiaries(diaries);
  }, [diaries]);

  

  useEffect(() => {
    const checkAuth = async () => {
      await checkToken();
      setIsReady(true);
    };
    checkAuth();
    if (user?.user._id) {
      setavatar(`http://localhost:5001/api/images/image?filename=${user?.user.avatar}`);
      console.log('头像:', avatar);
    }
    if (isReady && !isAuthenticated) {
      router.push({
        pathname: '/authscreen',
        params: { from: '/(tabs)/profile' }
      });
    }
  }, [isReady, isAuthenticated]);
  
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filteredDiariestrue.length > 0) {
      setDiaries(prev => {
        const existingIds = new Set(prev.map(d => d.id));
        const uniqueNewDiaries = filteredDiariestrue.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewDiaries];
      });
    }
  }, [filteredDiariestrue]);


  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      loadMoreData();
      setPageture(prev => prev + 1);
      
      // 使用Set对所有数据进行去重
      setDiaries(prev => {
        const existingIds = new Set(prev.map(d => d.id));
        const uniqueNewData = MoreData.filter(item => !existingIds.has(item.id));
        
        // 创建一个新的Set来存储所有不重复的数据
        const allDiaries = [...prev];
        uniqueNewData.forEach(diary => {
          if (!existingIds.has(diary.id)) {
            allDiaries.push(diary);
          }
        });
        
        return allDiaries;
      });

      const start = page * 10;
      const end = start + 10;
      const newDiaries = travelDiaries.diaries.slice(start, end) as unknown as TravelDiary[];
      
      if (newDiaries.length > 0) {
        setDiaries(prev => {
          const existingIds = new Set(prev.map(d => d.id));
          const uniqueNewDiaries = newDiaries.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewDiaries];
        });
        setPage(page + 1);
      }
      setLoading(false);
    }, 1000);
  }, [diaries, loading, page]);

  // 跳转详情
  const handlePressItem = (diary: TravelDiary) => {
    router.push(`/diary-list/${diary.id}`);
  };

  const debouncedSearch = useMemo(
    () => debounce((text: string) => {
      if (!text.trim()) {
        setFilteredDiaries(diaries);
        setIsSearching(false);
        return;
      }

      const searchLower = text.toLowerCase();
      const filtered = diaries.filter(diary => {
        const title = diary.title?.toLowerCase() || '';
        const content = diary.content?.toLowerCase() || '';
        const nickname = diary.user?.nickname?.toLowerCase() || '';
        console.log('当前搜索:', title, ',', content);

        return (
          title.includes(searchLower) ||
          content.includes(searchLower) ||
          nickname.includes(searchLower)
        );
      });

      setFilteredDiaries(filtered);
      setIsSearching(true);
    }, 500), // 500ms延迟
    [diaries] // 依赖项
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      
    <View style={styles.container}>
      {/* 顶部欢迎栏和用户头像 */}
      <View style={styles.topBar}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>用一篇游记，看遍世界。</Text>
        </View>
        {/* <TouchableOpacity onPress={() => console.log('头像点击')}>
        <Image 
          source={{ uri: avatar }} 
          style={styles.avatar}
        />
      </TouchableOpacity> */}
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
            searching = {!!isSearching}
            onLoadMore={handleLoadMore}
            onPressItem={handlePressItem}
          />
          {!hasMore && (
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
