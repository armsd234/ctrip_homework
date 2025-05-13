import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Text,
    ActivityIndicator,
    Platform,
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
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    style,
    imageStyle,
    disabled = false,
    iscameraIcon = true,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = () => {
        if (disabled) return;
        setModalVisible(true);
    };

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
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          allowsMultipleSelection: true,
          selectionLimit: 1, // 限制选择数量
          quality: 0.7,
        });
    
        if (!result.canceled && result.assets) {
          const newImages = result.assets[0];
          upload(newImages);
        }
      };

      const upload = async (imageAsset: ImagePicker.ImagePickerAsset) => {
        try {
          setIsLoading(true);
          const formData = new FormData();
          formData.append('image', {
            uri: imageAsset.uri,
            name: `image_${Date.now()}.jpg`, // 确保唯一文件名
            type: getMimeType(imageAsset.uri), // 自动获取MIME类型
          } as any);

          const response = await api.post('/api/images/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            //   'Accept': 'application/json',
            },
          });      
    
          if (response.data.filename && onChange) {
            onChange(response.data.filename);
        }
        } catch (error) {
          console.error('上传失败:', error);
        } finally {
          setIsLoading(false);
          setModalVisible(false)
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
                <Image
                    source={getImageSource()}
                    style={[styles.image, imageStyle]}
                />
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
                {!disabled && !isLoading && iscameraIcon && (
                    <View style={styles.editOverlay} >
                        <Ionicons name="camera" size={24} color="#fff" />
                    </View>
                )}

                {!disabled && !isLoading && !iscameraIcon && (
                    <TouchableOpacity style={styles.addAvatarButton} onPress={handlePress} disabled={disabled || isLoading}>
                        <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
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
});

// 添加比较函数，只在关键属性改变时重新渲染
const areEqual = (prevProps: ImageUploadProps, nextProps: ImageUploadProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.disabled === nextProps.disabled &&
        prevProps.iscameraIcon === nextProps.iscameraIcon
    );
};

export default React.memo(ImageUpload, areEqual);
