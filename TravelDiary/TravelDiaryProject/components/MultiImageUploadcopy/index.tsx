import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 18;
const ITEM_SIZE = (width - ITEM_MARGIN * 4) / 3;

interface MultiImageUploadProps {
  initialImages?: string[];
  onUploadSuccess: (filenames: string[]) => void;
  onUploadError?: (error: Error) => void;
}

const ImageGridUploader = ({
  initialImages = [],
  onUploadSuccess,
  onUploadError
}: MultiImageUploadProps) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  // 请求相册权限
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限请求', '需要相册权限才能上传图片');
        return false;
      }
    }
    return true;
  };

  // 选择图片
  const pickImages = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission || images.length >= 9) return;

    const remainingSlots = 9 - images.length;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: Platform.OS === 'web',  // 仅在 web 平台启用多选
        selectionLimit: remainingSlots,
        quality: 0.7,
        base64: Platform.OS === 'web',  // 在 web 平台获取 base64 数据
      });

      if (!result.canceled && result.assets) {
        setIsUploaded(false);
        const newImages = result.assets.slice(0, remainingSlots).map(asset => {
          // 对于 web 平台，直接使用 base64 数据
          if (Platform.OS === 'web' && 'base64' in asset) {
            return `data:image/jpeg;base64,${asset.base64}`;
          }
          return asset.uri;
        });

        setImages([...images, ...newImages]);
        
        if (result.assets.length > remainingSlots) {
          Alert.alert('提示', '最多只能上传9张图片');
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: string) => {
    try {
      if (Platform.OS === 'web') {
        // Web 平台：处理 base64 或 blob 数据
        if (file.startsWith('data:')) {
          // Base64 数据
          const response = await fetch(file);
          const blob = await response.blob();
          return blob;
        } else {
          // 普通 URL
          const response = await fetch(file);
          return await response.blob();
        }
      } else {
        // iOS 平台：处理文件 URI
        return {
          uri: file,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg'
        };
      }
    } catch (error) {
      console.error('处理文件失败:', error);
      throw error;
    }
  };

  const upload = async () => {
    if (images.length === 0) {
      onUploadSuccess([]);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();

      // 处理所有图片
      await Promise.all(
        images.map(async (image, index) => {
          const file = await handleFileUpload(image);
          if (Platform.OS === 'web') {
            formData.append('images', file, `image_${Date.now()}_${index}.jpg`);
          } else {
            formData.append('images', file as any);
          }
        })
      );

      const response = await api.post('/api/images/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      if (response.data) {
        const filenames = response.data.filenames;
        onUploadSuccess(filenames);
        setIsUploaded(true);
      }
    } catch (error) {
      console.error('上传失败:', error);
      Alert.alert('上传失败', '请检查网络连接后重试');
      if (onUploadError) {
        onUploadError(error as Error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setIsUploaded(false);
  };

  // 渲染每个网格项
  const renderItem = ({ item, index }: { item: string | null; index: number }) => {
    if (item === null) {
      return (
        <View style={styles.gridItem}>
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickImages}
            disabled={isUploading}
          >
            <Ionicons name="add" size={32} color="#666" />
            <Text style={styles.uploadText}>上传图片</Text>
            <Text style={styles.uploadText}>({images.length}/9)</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.gridItem}>
        <Image source={{ uri: item }} style={styles.gridImage} />
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => removeImage(index)}
          disabled={isUploading}
        >
          <Ionicons name="close-circle" size={20} color="#ff2442" />
        </TouchableOpacity>
      </View>
    );
  };

  // 准备数据：图片 + 上传按钮（如果还有空位）
  const gridData: (string | null)[] = [...images];
  if (images.length < 9) {
    gridData.push(null);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={gridData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item ? item : `upload-btn-${index}`}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
      />
      {images.length > 0 && (
        <TouchableOpacity
          style={[
            styles.uploadToBack,
            { backgroundColor: !isUploaded ? '#2c91ef' : '#666' },
            isUploading && styles.uploadingButton
          ]}
          onPress={upload}
          disabled={isUploading}
        >
          <Text style={styles.uploadToBackText}>
            {isUploading && '上传中...'}
            {(!isUploading && !isUploaded) && `确认上传 (${images.length}/ 9 )`}
            {isUploaded && '上传完成'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  columnWrapper: {
    // justifyContent: 'space-around',
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    margin: ITEM_MARGIN / 2
  },
  uploadButton: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#999',
    overflow: 'hidden',
  },
  uploadText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  uploadToBack: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  uploadingButton: {
    opacity: 0.7,
  },
  uploadToBackText: {
    fontSize: 12,
    color: 'white',
  },
});

export default ImageGridUploader;