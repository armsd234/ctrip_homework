import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { decode } from 'base-64';

const { width } = Dimensions.get('window');

interface VideoUploadProps {
  initialVideo?: string;
  onUploadSuccess: (filename: string) => void;
  onUploadError?: (error: Error) => void;
}

export default function VideoUploader({
  initialVideo = '',
  onUploadSuccess,
  onUploadError,
}: VideoUploadProps) {
  const [video, setVideo] = useState(initialVideo);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  console.log('initialVideo',initialVideo);
  console.log('video:',video);
  const videoSource = `http://localhost:5001/api/images/video?filename=${video}`;
  console.log(videoSource);
  
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  useEffect(()=>{
    console.log('initialVideo:',initialVideo);
    console.log("vcoideo:::dfd",video);
    setVideo(initialVideo);
  },[initialVideo]);

  const selectVideo = async () => {
    setUploading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      await uploadVideo(result.assets[0]);
    } else {
      setUploading(false);
    }
  }

  const uploadVideo = async (videoAsset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    const base64Data = videoAsset.uri.split(',')[1];
    const mimeType = videoAsset.mimeType || 'video/mp4';
    console.log('2');

    // 将 base64 转换为 Blob
    // const byteCharacters = atob(base64Data);
    // const byteCharacters = decode(base64Data); // 替代 atob()
    // const byteArrays = [];
    // console.log('3');
    // for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    //   const slice = byteCharacters.slice(offset, offset + 512);
    //   const byteNumbers = new Array(slice.length);

    //   for (let i = 0; i < slice.length; i++) {
    //     byteNumbers[i] = slice.charCodeAt(i);
    //   }

    //   const byteArray = new Uint8Array(byteNumbers);
    //   byteArrays.push(byteArray);
    // }
    // console.log('4');
    // const blob = new Blob(byteArrays, { type: mimeType });
    // const file = new File([blob], 'video.mp4', { type: mimeType });
    formData.append('video', {
      uri: videoAsset.uri,
      name: videoAsset.fileName || 'video.mp4',
      type: videoAsset.mimeType || 'video/mp4',
    } as any);
    console.log('formData', formData.get('video'));

    try {
      const response = await api.post('/api/images/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('上传响应:', response.data);

      if (response.data) {
        const filename = response.data.filename;
        onUploadSuccess(filename);
        setVideo(filename);
        setUploaded(true);
        // alert('上传成功！');
      }
      // await api.post('/api/images/video', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      //   onUploadProgress: (progressEvent) => {
      //     const percent = Math.round(
      //       progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0
      //     );
      //     setProgress(percent);
      //   },
      // });
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

  const removeImage = () => {
    onUploadSuccess('');
    setVideo('');
    setUploading(false);
    setUploaded(false);
  };

  return (
    <View style={styles.container}>
      {uploaded ? (
        <>
          <VideoView
            player={player}
            style={styles.videoContainer}
          // useNativeControls
          // resizeMode="contain"
          />
          <TouchableOpacity style={styles.deleteButton} onPress={() => removeImage()}>
            <Ionicons name="close-circle" size={20} color="#ff2442" />
          </TouchableOpacity>

          {/* </TouchableOpacity> */}
        </>
      ) : (
        // <TouchableOpacity style={styles.button} onPress={selectVideo}>
        //   <Text style={styles.buttonText}>选择视频</Text>
        // </TouchableOpacity>
        <View style={styles.uploadItem}>
          <TouchableOpacity onPress={selectVideo}>
            {
              uploading ? (
                <Text style={styles.uploadText}>上传中...</Text>
              ) : (
                <View style={styles.uploadButton}>
                  <Ionicons name="add" size={40} color="#666" />
                  <Text style={styles.uploadText}>上传视频</Text>
                </View>
              )
            }
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
    height: width / 2,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16
  },
  uploadButton: {
    width: width - 32,
    height: width / 2,
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
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  videoContainer: {
    width: width - 32,
    height: width / 2,
    // borderRadius: 40,
    margin: 16
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    // padding: 2,
  },
});