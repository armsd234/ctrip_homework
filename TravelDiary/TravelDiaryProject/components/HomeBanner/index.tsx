import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const spriteImage = require('../../assets/images/banner_sprite.jpg');

const totalHeight = 600;
const itemCount = 3;
const itemHeight = totalHeight / itemCount;
const displayHeight = 175;

export default function SpriteBanner() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ 自动轮播（使用取余法）
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % itemCount;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentIndex(index % itemCount);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={[0, 1, 2]}
        keyExtractor={(item) => `banner-${item}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={styles.bannerWrapper}>
            <Image
              source={spriteImage}
              style={[
                styles.bannerImage,
                {
                  transform: [
                    {
                      translateY:
                        -itemHeight * (displayHeight / itemHeight) * item,
                    },
                  ],
                },
              ]}
              resizeMode="cover"
            />
          </View>
        )}
      />

      {/* ✅ 小圆点指示器 */}
      <View style={styles.dots}>
        {[0, 1, 2].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentIndex === i && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      width: screenWidth - 16,
      height: displayHeight,
      // borderRadius: 20
    },
    bannerWrapper: {
      width: screenWidth,
      height: displayHeight,
      overflow: 'hidden',
      // borderRadius: 20
    },
    bannerImage: {
      width: screenWidth,
      height: totalHeight * (displayHeight / itemHeight),
    },
    dots: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dot: {
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
  });