import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 18;
const ITEM_SIZE = (width - ITEM_MARGIN * 4) / 3; // 计算每项宽度（考虑左右边距）

interface MultiImageUploadProps {
  onUploadSuccess: (filenames: string[]) => void;
  onUploadError?: (error: Error) => void;
}

const ImageGridUploader = ({
  onUploadSuccess,
  onUploadError
}: MultiImageUploadProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 请求相册权限
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('需要相册权限才能上传图片');
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots, // 限制选择数量
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
      setImages([...images, ...newImages]);
      if (result.assets.length > remainingSlots) {
        console.log("超出数量限制！");

        Alert.alert('提示', '最多只能上传9张图片');
      }
    }
  };

  // Helper function to get MIME type based on file extension
  const getMimeType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      default:
        return 'application/octet-stream';
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
      await Promise.all(
        images.map(async (uri, index) => {

          // 获取文件信息
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) throw new Error(`文件不存在: ${uri}`);

          // 添加到FormData
          formData.append('images', {
            uri: uri,
            name: `image_${Date.now()}_${index}.jpg`, // 确保唯一文件名
            type: getMimeType(uri), // 自动获取MIME类型
          } as any);
        })
      );
      images.forEach(async (image, index) => {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append(`images[${index}]`, blob, `image-${index}.jpg`);
      });
      const response = await api.post('/api/images/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });      

      if (response.data) {
        // console.log('上传成功:', response.data);
        const filenames = response.data.filenames;
        onUploadSuccess(filenames);
      }
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 渲染每个网格项
  const renderItem = ({ item, index }: { item: string | null; index: number }) => {
    if (item === null) {
      return (
        <View style={styles.gridItem}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
            <Ionicons name="add" size={32} color="#666" />
            <Text style={styles.uploadText}>上传图片</Text>
            <Text style={styles.uploadText}>({images.length}/9)</Text>
          </TouchableOpacity>
        </View>
        // <TouchableOpacity style={styles.gridItem} onPress={pickImages}>
        //   <View style={styles.uploadContent}>
        //     <Ionicons name="add" size={32} color="#666" />
        //     <Text style={styles.uploadText}>添加图片</Text>
        //     <Text style={styles.countText}>{images.length}/9</Text>
        //   </View>
        // </TouchableOpacity>
      );
    }

    return (
      <View style={styles.gridItem}>
        <Image source={{ uri: item }} style={styles.gridImage} />
        <TouchableOpacity style={styles.deleteButton} onPress={() => removeImage(index)}>
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
        scrollEnabled={false} // 禁用滚动（固定高度）
      />
      {images.length > 0 && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={upload}
          disabled={isUploading}
        >
          <Text style={styles.uploadText}>
            {isUploading ? '上传中...' : `确认上传 (${images.length}/ 9 )`}
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
    // marginBottom: ITEM_MARGIN / 2,
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
  uploadContent: {
    alignItems: 'center',
    backgroundColor: 'pink'
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
    // borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  countText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    // padding: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#ff2442',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default ImageGridUploader;