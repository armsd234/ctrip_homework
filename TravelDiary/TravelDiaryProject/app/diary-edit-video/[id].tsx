import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import VideoUpload from '@/components/VideoUpload';
import { api } from '@/services/api';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';

const maxTitleLength = 20;
const maxContentLength = 100;

export default function TravelPublishScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [diary, setDiary] = useState<TravelDiary | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoFilename, setVideoFilename] = useState<string>('');

    useEffect(() => {
        const fetchDiary = async () => {
            try {
                const response = await api.get(`/api/travel-notes/${id}`);
                if (response.data && response.data.data && response.data.data[0]) {
                    const diaryData = response.data.data[0];
                    setDiary(diaryData);

                    // 设置表单初始值
                    setTitle(diaryData.title || '');
                    setContent(diaryData.content || '');
                    setVideoFilename(diaryData.video || '');
                }
            } catch (error) {
                console.error('获取游记详情失败:', error);
                Alert.alert('错误', '获取游记详情失败');
            }
        };

        fetchDiary();
    }, [id]);

    console.log('videoFilename:', videoFilename);

    const handlePublish = async () => {
        if (videoFilename === '') {
            Alert.alert('提示', '请上传视频');
            return;
        }

        if (!title || !content) {
            Alert.alert('提示', '标题和内容不能为空');
            return;
        }

        const noteData = { title, content, video: videoFilename };
        console.log('发布内容：', noteData);
        try {
            const response = await api.post('/api/travel-notes/', noteData);
            if (response.status === 201) {
                router.push('/(tabs)/mydiary');
                alert('游记创建成功');
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('游记创建失败');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back-outline" size={30} color="black" />
                </Pressable>
                <Text style={styles.headerTitle}>发布视频游记</Text>
            </View>

            <ScrollView>
                <View>
                    <VideoUpload
                        initialVideo={videoFilename}
                        onUploadSuccess={(filename) => {
                            setVideoFilename(filename);
                            if (filename) {
                                console.log('上传成功:', filename);
                                Alert.alert('提示', `视频已上传`);
                            }
                        }}
                        onUploadError={(error) => {
                            Alert.alert('上传失败', error.message);
                        }}
                    />
                </View>

                <View style={styles.container}>
                    {/* 标题输入 */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputTitle}
                            placeholder="添加标题"
                            placeholderTextColor="#999"
                            value={title}
                            onChangeText={(text) => {
                                if (text.length <= maxTitleLength) {
                                    setTitle(text);
                                }
                            }}
                            maxLength={maxTitleLength}
                        />
                        <Text style={styles.charCount}>
                            {title.length}/{maxTitleLength}
                        </Text>
                    </View>

                    {/* 正文内容 */}
                    <TextInput
                        style={styles.inputContent}
                        placeholder="记录你的旅行故事..."
                        placeholderTextColor="#999"
                        value={content}
                        onChangeText={(text) => {
                            if (text.length <= maxContentLength) {
                                setContent(text);
                            }
                        }}
                        multiline
                        maxLength={maxContentLength}
                    />
                </View>
            </ScrollView>

            {/* 底部操作栏 */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.draftBtn}>
                    <Ionicons name="document-text-outline" size={18} color="666" />
                    <Text style={{ color: '#666', marginLeft: 4 }}>存草稿</Text>
                </Pressable>

                <Pressable style={styles.publishMainBtn} onPress={handlePublish}>
                    <Text style={styles.publishText}>发布</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },

    publishButton: {
        color: '#007bff',
        fontSize: 16,
    },
    container: {
        paddingLeft: 16,
        paddingRight: 16
    },
    imageUploadSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    formItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    formInput: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    draftBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    publishMainBtn: {
        backgroundColor: '#2c91ef',
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 20,
        marginLeft: 16,
    },
    publishText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    inputTitle: {
        fontSize: 18,
        padding: 12,
        marginRight: 30,
        fontWeight: 'bold',
        borderRadius: 6,
        paddingVertical: 8,
    },
    inputContent: {
        flex: 1,
        fontSize: 16,
        // height: 200,
        padding: 12,
        // borderWidth: 1,
        // borderColor: '#ddd',
        borderRadius: 6,
        textAlignVertical: 'top',
    },
    charCount: {
        textAlign: 'right',
        color: '#999',
        fontSize: 12,
        marginTop: 4,
        right: 0,
        position: 'absolute',
    },
});