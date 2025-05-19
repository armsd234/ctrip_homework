import React, { useState, useCallback } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Text,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/services/api';
import CachedImage from '@/components/CachedImage';

interface ImageUploadProps {
    value?: string;
    onChange?: (filename: string) => void;
    style?: any;
    imageStyle?: any;
    disabled?: boolean;
    iscameraIcon?: boolean;
    onUploadSuccess?: (filename: string) => void;
    onUploadError?: (error: Error) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    style,
    imageStyle,
    disabled = false,
    iscameraIcon = true,
    onUploadSuccess,
    onUploadError,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [image, setImage] = useState<string | null>(value || null);

    const handlePress = () => {
        if (disabled) return;
        setModalVisible(true);
    };

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
    
      // 选择图片
      const pickImages = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;
    
        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: Platform.OS === 'web',
          });
    
          if (!result.canceled && result.assets && result.assets[0]) {
            const selectedAsset = result.assets[0];
            setImage(selectedAsset.uri);
            await uploadImage(selectedAsset);
          }
        } catch (error) {
          console.error('选择图片失败:', error);
          Alert.alert('错误', '选择图片失败，请重试');
        }
      };

      const uploadImage = async (selectedAsset: ImagePicker.ImagePickerAsset) => {
        if (!selectedAsset.uri) return;

        try {
          setIsLoading(true);
          const formData = new FormData();

          if (Platform.OS === 'web') {
            try {
              const response = await fetch(selectedAsset.uri);
              const blob = await response.blob();
              formData.append('image', blob, `image_${Date.now()}.jpg`);
            } catch (error) {
              console.error('处理图片失败:', error);
              throw error;
            }
          } else {
            formData.append('image', {
              uri: selectedAsset.uri,
              type: 'image/jpeg',
              name: `image_${Date.now()}.jpg`,
            } as any);
          }

          const response = await api.post('/api/images/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
            },
          });

          if (response.data && response.data.filename) {
            if (typeof onUploadSuccess === 'function') {
              onUploadSuccess(response.data.filename);
            }
            if (typeof onChange === 'function') {
              onChange(response.data.filename);
            }
          } else {
            throw new Error('Upload response missing filename');
          }
        } catch (error) {
          console.error('上传失败:', error);
          Alert.alert('上传失败', '请检查网络连接后重试');
          setImage(null);
          if (typeof onUploadError === 'function') {
            onUploadError(error as Error);
          }
        } finally {
          setIsLoading(false);
          setModalVisible(false);
        }
      };

    const getImageSource = () => {
        if (typeof value === 'string') {
            console.log(value);
            return { uri: value };
        } else if (typeof value === 'number') {
            return value;
        }
        return require('@/assets/images/favicon.png');
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.container, style]}
                onPress={handlePress}
                disabled={disabled || isLoading}
            >
                {image ? (
                    <>
                        <Image
                            source={{ uri: image }}
                            style={[styles.image, imageStyle]}
                        />
                        {isLoading && (
                            <View style={styles.loadingOverlay}>
                                <Text style={styles.uploadingText}>上传中...</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <Image
                            source={getImageSource()}
                            style={[styles.image, imageStyle]}
                        />
                        {/* {!disabled && (
                            <View style={styles.editOverlay} >
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>
                        )} */}

                        {/* {!disabled && !isLoading && !iscameraIcon && (
                            <TouchableOpacity style={styles.addAvatarButton} onPress={handlePress} disabled={disabled || isLoading}>
                                <Ionicons name="add" size={18} color="white" />
                            </TouchableOpacity>
                        )} */}
                    </>
                )}
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => pickImages()}
                        >
                            <Ionicons name="camera-outline" size={24} color="#333" />
                            <Text style={styles.modalOptionText}>拍照</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => pickImages()}
                        >
                            <Ionicons name="images-outline" size={24} color="#333" />
                            <Text style={styles.modalOptionText}>从相册选择</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    modalCancel: {
        padding: 16,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#666',
    },
    addAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFC107', // Yellowish color
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white' // White border
      },
    uploadingText: {
        color: 'white',
        fontSize: 14,
    },
});

// 添加比较函数，只在关键属性改变时重新渲染
const areEqual = (prevProps: ImageUploadProps, nextProps: ImageUploadProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.iscameraIcon === nextProps.iscameraIcon &&
        prevProps.onUploadSuccess === nextProps.onUploadSuccess &&
        prevProps.onUploadError === nextProps.onUploadError
    );
};

export default React.memo(ImageUpload, areEqual);
