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

interface ImageUploadProps {
    value?: string | number;
    onChange?: (filename: string) => void;
    style?: any;
    imageStyle?: any;
    disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    style,
    imageStyle,
    disabled = false,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = () => {
        if (disabled) return;
        setModalVisible(true);
    };

    const handleImagePick = async (useCamera: boolean) => {
        try {
            setModalVisible(false);
            
            // 请求权限
            const permissionType = useCamera ? 
                ImagePicker.requestCameraPermissionsAsync() : 
                ImagePicker.requestMediaLibraryPermissionsAsync();
            
            const { status } = await permissionType;
            if (status !== 'granted') {
                alert('需要访问权限才能上传图片');
                return;
            }

            // 选择图片
            const result = await (useCamera ? 
                ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                }) :
                ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                })
            );

            if (!result.canceled) {
                console.log('Selected image:', result.assets[0]);
                await uploadImage(result.assets[0]);
            }
        } catch (error) {
            console.error('选择图片失败:', error);
            alert('选择图片失败，请重试');
        }
    };

    const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
        try {
            setIsLoading(true);

            // 创建 FormData
            const formData = new FormData();
            
            // 处理 base64 图片数据
            const base64Data = imageAsset.uri.split(',')[1];
            const mimeType = imageAsset.mimeType || 'image/png';
            
            // 将 base64 转换为 Blob
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, { type: mimeType });
            
            // 创建文件对象
            const file = new File([blob], 'image.png', { type: mimeType });
            
            // 添加到 FormData
            formData.append('image', file);

            console.log('准备上传图片:', {
                type: mimeType,
                size: file.size,
                name: file.name
            });

            const response = await api.post('/api/images/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
            });

            console.log('上传响应:', response.data);

            if (response.data.filename && onChange) {
                onChange(response.data.filename);
            }
        } catch (error: any) {
            console.error('上传图片失败:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                }
            });
            alert(error.response?.data?.message || '上传图片失败，请重试');
        } finally {
            setIsLoading(false);
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
                {!disabled && !isLoading && (
                    <View style={styles.editOverlay}>
                        <Ionicons name="camera" size={24} color="#fff" />
                    </View>
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
                            onPress={() => handleImagePick(true)}
                        >
                            <Ionicons name="camera-outline" size={24} color="#333" />
                            <Text style={styles.modalOptionText}>拍照</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => handleImagePick(false)}
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
});

export default ImageUpload;
