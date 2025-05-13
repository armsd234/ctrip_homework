import React, { useState, useEffect } from 'react';
import { Image, ImageProps, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  cacheKey?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({ uri, cacheKey, ...props }) => {
  const [cachedUri, setCachedUri] = useState<string | null>(null);

  useEffect(() => {
    if (!uri) return;

    const key = cacheKey || uri;
    
    const loadCachedImage = async () => {
      try {
        // 尝试从缓存获取
        const cached = await AsyncStorage.getItem(`image_cache_${key}`);
        if (cached) {
          setCachedUri(cached);
        }
        
        // 无论是否有缓存，都获取新的图片并更新缓存
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64data = reader.result as string;
          await AsyncStorage.setItem(`image_cache_${key}`, base64data);
          setCachedUri(base64data);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error caching image:', error);
        setCachedUri(uri); // 如果缓存失败，使用原始URI
      }
    };

    loadCachedImage();
  }, [uri, cacheKey]);

  // Web平台使用原始URI，因为Web有自己的缓存机制
  if (Platform.OS === 'web') {
    return <Image source={{ uri }} {...props} fadeDuration={0} />;
  }

  // 移动平台使用缓存的URI
  return (
    <Image
      source={{ uri: cachedUri || uri }}
      {...props}
      fadeDuration={0} // 禁用淡入效果以防止闪烁
    />
  );
};

export default React.memo(CachedImage); 