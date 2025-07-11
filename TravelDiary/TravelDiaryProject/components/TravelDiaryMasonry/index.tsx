import { StyleSheet, View, ScrollView, Image, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { TravelDiary, TravelDiaryMasonryProps } from './types';
import { useMemo } from 'react';
import HomeBanner from '../HomeBanner';

const CARD_MARGIN = 8;

export default function TravelDiaryMasonry({
  diaries = [],
  loading = false,
  searching = false,
  onPressItem,
  onLoadMore,
  onScroll,
  refreshControl
}: TravelDiaryMasonryProps) {
  console.log('diaries', diaries);

  // 将数据分为左右两列
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: TravelDiary[] = [];
    const right: TravelDiary[] = [];

    // 计算每列当前高度
    let leftHeight = 0;
    let rightHeight = 0;

    diaries.forEach((diary) => {
      // 根据当前列高度决定放入哪一列
      if (leftHeight <= rightHeight) {
        left.push(diary);
        // 模拟计算卡片高度
        leftHeight += 250 + Math.random() * 100;
      } else {
        right.push(diary);
        rightHeight += 250 + Math.random() * 100;
      }
    });

    return { leftColumn: left, rightColumn: right };
  }, [diaries]);

  // 渲染单个游记卡片
  const renderItem = (item: TravelDiary) => (
    <Pressable style={styles.card} onPress={() => onPressItem?.(item)} >
      <Image
        source={Array.isArray(item.coverImage) ? { uri: item.coverImage[0] } : { uri: item.coverImage }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.nickname} numberOfLines={1}>{item.user.nickname}</Text>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views > 9999 ? (item.views / 10000).toFixed(1) + `万` : item.views}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.container}
      onScroll={(event) => {
        // 调用外部传入的onScroll
        onScroll?.(event);
        // 保持原有的加载更多逻辑
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
          onLoadMore?.();
        }
      }}
      scrollEventThrottle={400}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {!searching &&
        <View style={styles.banner}>
          <HomeBanner />
        </View>}

      <View style={styles.columns}>
        <View style={styles.column}>
          {leftColumn.map((item) => (
            <View key={item.id}>
              {renderItem(item)}
            </View>
          ))}
        </View>
        <View style={styles.column}>
          {rightColumn.map((item) => (
            <View key={item.id}>
              {renderItem(item)}
            </View>
          ))}
        </View>
      </View>
      {loading && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>加载中...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    margin: CARD_MARGIN,
  },
  columns: {
    flexDirection: 'row',
    padding: CARD_MARGIN / 2,
  },
  column: {
    flex: 1,
    marginHorizontal: CARD_MARGIN / 2,
  },
  card: {
    marginBottom: CARD_MARGIN,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  nickname: {
    width: 70,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // whiteSpace: 'nowrap',
    fontSize: 12,
    lineHeight: 24,
    color: '#666',
  },
  statItem: {
    flexDirection: 'row',
    right: 0,
    marginLeft: 'auto'
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
}); 