import { StyleSheet, TextInput, TouchableOpacity, View,Image } from 'react-native';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Text } from '@/components/Themed';
import TravelDiaryMasonry from '@/components/TravelDiaryMasonry';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import travelDiaries from '@/data/travelDiaries.json';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 10;

export default function TabOneScreen() {
  const router = useRouter();

  // diaries 游记数据、loading 加载状态、page 当前页码
  const [searchText, setSearchText] = useState('');
  const [diaries, setDiaries] = useState<TravelDiary[]>(travelDiaries.diaries as unknown as TravelDiary[]);
  const [filteredDiaries, setFilteredDiaries] = useState<TravelDiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const avatar = "https://picsum.photos/100/100?random=1";

  useEffect(() => {
    setFilteredDiaries(diaries);
  }, [diaries]);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const start = page * 10;
      const end = start + 10;
      const newDiaries = travelDiaries.diaries.slice(start, end) as unknown as TravelDiary[];
      if (newDiaries.length > 0) {
        setDiaries(prev => [...prev, ...newDiaries]);
        setPage(page + 1);
      }
      setLoading(false);
    }, 1000);
  }, [diaries, loading, page]);

  // 跳转详情
  const handlePressItem = (diary: TravelDiary) => {
    router.push(`/diary-list/${diary.id}`);
  };

  // 搜索
  // const handleSearchChange = useCallback((text: string) => {
  //   setSearchText(text);
  //   setIsSearching(text.length > 0);
  //   console.log('[搜索] 输入内容:', text);
  //   console.log('[搜索] 当前diaries数量:', diaries.length);

  //   if (!text.trim()) {
  //     setFilteredDiaries(diaries);
  //     setIsSearching(false);
  //     return;
  //   }

  //   const searchLower = text.toLowerCase();
  //   const filtered = diaries.filter(diary => {
  //     const title = diary.title?.toLowerCase() || '';
  //     const content = diary.content?.toLowerCase() || '';
  //     const nickname = diary.user?.nickname?.toLowerCase() || '';
  //     console.log('当前搜索:', title,',',content);

  //     return (
  //       title.includes(searchLower) ||
  //       content.includes(searchLower) ||
  //       nickname.includes(searchLower)
  //     );
  //   });

  //   console.log('[搜索] 过滤后结果数量:', filtered.length);
  //   setFilteredDiaries(filtered);
  // }, [diaries]);

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
        <TouchableOpacity onPress={() => console.log('头像点击')}>
        <Image 
          source={{ uri: avatar }} 
          style={styles.avatar}
        />
      </TouchableOpacity>
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
