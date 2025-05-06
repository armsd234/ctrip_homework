import { StyleSheet, View } from 'react-native';
import { useState, useCallback } from 'react';
import { Text } from '@/components/Themed';
import TravelDiaryMasonry from '@/components/TravelDiaryMasonry';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import travelDiaries from '@/data/travelDiaries.json';
import { useRouter } from 'expo-router';

const PAGE_SIZE = 10;

export default function TabOneScreen() {
  const router = useRouter();

  // diaries 游记数据、loading 加载状态、page 当前页码
  const [diaries, setDiaries] = useState<TravelDiary[]>(travelDiaries.diaries as TravelDiary[]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setTimeout(() => {
      const start = page * 10;
      const end = start + 10;
      const newDiaries = travelDiaries.diaries.slice(start, end) as TravelDiary[];
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

  return (
    <View style={styles.container}>
      <TravelDiaryMasonry
        diaries={diaries}
        loading={loading}
        onLoadMore={handleLoadMore}
        onPressItem={handlePressItem}
      />
      {!hasMore && !loading && (
        <View style={styles.noMoreContainer}>
          <Text style={styles.noMoreText}>没有更多了哦</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
