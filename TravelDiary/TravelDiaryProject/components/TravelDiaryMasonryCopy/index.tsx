import { StyleSheet, View, ScrollView, Dimensions, Image, Pressable, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { TravelDiary, TravelDiaryMasonryProps } from './types';
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { getTravelDiaries } from '@/services/travelDiaryService';
import HomeBanner from '../HomeBanner';
import { useEvent } from 'expo';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

// 根据屏幕宽度计算每列宽度
const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const COLUMN_WIDTH = (width - CARD_MARGIN * 5) / 2;

// 创建一个缓存对象来存储已加载的图片
const imageCache = new Map();

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// 创建一个缓存的图片组件
const CachedImage = React.memo(({ uri, style }: { uri: string | undefined, style: any }) => {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(uri));

  useEffect(() => {
    if (uri && !imageCache.has(uri)) {
      Image.prefetch(uri).then(() => {
        imageCache.set(uri, true);
        setIsLoaded(true);
      });
    }
  }, [uri]);

  if (!uri) return null;

  return (
    <Image
      source={{ uri }}
      style={[style, !isLoaded && { opacity: 0 }]}
      resizeMode="cover"
      fadeDuration={0}
    />
  );
});

// 创建一个视频组件
const VideoThumbnail = React.memo(({ uri, style }: { uri: string | undefined, style: any }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<Video>(null);
  const webVideoRef = React.useRef<HTMLVideoElement>(null);

  if (!uri) return null;

  const handlePlayPause = async () => {
    if (Platform.OS === 'web') {
      // Web 平台使用原生 HTML5 video 元素
      if (webVideoRef.current) {
        if (isPlaying) {
          webVideoRef.current.pause();
        } else {
          await webVideoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      // Native 平台使用 expo-av
      try {
        if (videoRef.current) {
          if (isPlaying) {
            await videoRef.current.pauseAsync();
          } else {
            await videoRef.current.playAsync();
          }
          setIsPlaying(!isPlaying);
        }
      } catch (error) {
        console.error('Error playing/pausing video:', error);
      }
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[style, { backgroundColor: '#000' }]}>
        <video
          ref={webVideoRef}
          src={uri}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <Pressable 
          style={styles.playButton} 
          onPress={handlePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[style, { backgroundColor: '#000' }]}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={style}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isMuted={true}
        onLoad={() => setIsLoaded(true)}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
          }
        }}
      />
      <Pressable 
        style={styles.playButton} 
        onPress={handlePlayPause}
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color="white" 
        />
      </Pressable>
    </View>
  );
});

const TravelDiaryMasonry = ({
  diaries = [],
  loading = false,
  onPressItem,
  onLoadMore,
  searching = false
}: TravelDiaryMasonryProps) => {
  // 将数据分为左右两列
  const { leftColumn, rightColumn } = useMemo(() => {
    const left: TravelDiary[] = [];
    const right: TravelDiary[] = [];

    let leftHeight = 0;
    let rightHeight = 0;

    diaries.forEach((diary) => {
      if (leftHeight <= rightHeight) {
        left.push(diary);
        leftHeight += 250 + Math.random() * 100;
      } else {
        right.push(diary);
        rightHeight += 250 + Math.random() * 100;
      }
    });

    return { leftColumn: left, rightColumn: right };
  }, [diaries]);

  // 使用useCallback优化渲染函数
  const renderItem = useCallback((item: TravelDiary) => (
    <Pressable style={styles.card} onPress={() => onPressItem?.(item)}>
      {item.type === 'video' ? (
        <VideoThumbnail
          uri={item.video}
          style={styles.coverImage}
        />
      ) : (
        <CachedImage
          uri={Array.isArray(item.coverImage) ? item.coverImage[0] : item.coverImage}
          style={styles.coverImage}
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.userInfo}>
          <CachedImage
            uri={item.user.avatar}
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
  ), [onPressItem]);

  // 使用useCallback优化滚动处理函数
  const handleScroll = useCallback(({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      onLoadMore?.();
    }
  }, [onLoadMore]);

  return (
    <ScrollView
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={400}
      showsVerticalScrollIndicator={false}
    >
      {!searching && <View style={styles.banner} />}
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
};

// 添加比较函数，只在必要时重新渲染
const areEqual = (prevProps: TravelDiaryMasonryProps, nextProps: TravelDiaryMasonryProps) => {
  return (
    prevProps.diaries === nextProps.diaries &&
    prevProps.loading === nextProps.loading &&
    prevProps.searching === nextProps.searching
  );
};

export default React.memo(TravelDiaryMasonry, areEqual);

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