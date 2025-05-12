import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

export default function VideoUploader() {
  const [video, setVideo] = useState<{ uri: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    
    if (!result.canceled) {
      setVideo(result.assets[0]);
    }
    console.log(result);
    
  };

  const uploadVideo = async () => {
    if (!video) {
      alert('请先选择视频');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    // 关键：把本地文件转成Blob
  const response = await fetch(video.uri);
  const blob = await response.blob();
  const fileType = video.uri.split('.').pop(); // 获取文件后缀
  formData.append('video', blob, `video_${Date.now()}.${fileType}`);

  try {
    await api.post('/api/images/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0
        );
        setProgress(percent);
      },
    });
  } catch (error) {
    console.error('上传失败:', error);
  } finally {
    setUploading(false);
  }
    // formData.append('video', {
    //   uri: video.uri,
    //   type: 'video/mp4',
    //   name: `video_${Date.now()}.mp4`,
    // } as any);
    // console.log('formData', formData.get('video'));
    

    // try {
    //   await api.post('/api/images/video', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //     onUploadProgress: (progressEvent) => {
    //       const percent = Math.round(
    //         progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0
    //       );
    //       setProgress(percent);
    //     },
    //   });
    // //   alert('上传成功！');
    // } catch (error) {
    //   console.error('上传失败:', error);
    // } finally {
    //   setUploading(false);
    // }
  };

  return (
    <View style={styles.container}>
      {video ? (
        <>
          <Video
            source={{ uri: video.uri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={uploadVideo}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>
              {uploading ? `上传中... ${progress}%` : '确认上传'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        // <TouchableOpacity style={styles.button} onPress={selectVideo}>
        //   <Text style={styles.buttonText}>选择视频</Text>
        // </TouchableOpacity>
        <View style={styles.uploadItem}>
        <TouchableOpacity style={styles.uploadButton} onPress={selectVideo}>
          <Ionicons name="add" size={32} color="#666" />
          <Text style={styles.uploadText}>上传视频</Text>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadItem: {
    width: width - 32,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius:  20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16
  },
  uploadButton: {
    width: width - 32,
    height: 100,
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
  video: {
    width: 200,
    height: 200,
    borderRadius: 20,
    margin: 16
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});