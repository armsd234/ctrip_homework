import React, { useState, useRef,useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  ScrollView,
  Modal,
  TouchableOpacity,
  Linking,
  TextInput,
  KeyboardAvoidingView, Platform, Keyboard,
  Share
} from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import travelDiaries from '@/data/travelDiaries.json';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommentsList from '@/components/Comments';
import { api } from '@/services/api';

const { width: screenWidth } = Dimensions.get('window');

export default function DiaryListDetailScreen() {
  
  const { id } = useLocalSearchParams();
  console.log('Received diary id:', id); // 添加日志查看接收到的参数
  useEffect(() => {
    const fetchData = async () => {
      console.log('Received diary id:', id); 
      const response = await api.get(`/api/travel-notes/${id}`);
      console.log('Response:', response.data);
    };
    fetchData();
  }, []);
  
  const diary = travelDiaries.diaries.find(d => d.id.toString() === '1') as unknown as TravelDiary;
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false)
  const [likesCount, setLikesCount] = useState(diary?.likes || 0);
  const [collectsCount, setCollectsCount] = useState(diary?.collects || 0);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(diary.commentsData || []);

  if (!diary) {
    return (
      <View style={styles.container}>
        <Text>未找到该游记</Text>
      </View>
    );
  }

  // 统一 coverImage 为数组
  const images = Array.isArray(diary.coverImage)
    ? diary.coverImage
    : [diary.coverImage];

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => prev + (liked ? -1 : 1));
  };

  const handleCollect = () => {
    setCollected(!collected);
    setCollectsCount(prev => prev + (collected ? -1 : 1));
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `快来看看这篇游记：${diary.title} 👉 ${diary.location || '未知地点'}`,
        url: 'http://127.0.0.1:8081/diary-list/' + diary.id, // 可选：网页链接或App页
        title: '分享游记',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // iOS: 用户选择的分享方式
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Android: 成功分享
          console.log('Shared successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        // 取消分享
        console.log('Share dismissed');
      }
    } catch (error: any) {
      console.error('Share error:', error.message);
    }
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentImageIndex(index);
  };

  const handleTagPress = () => {
    setModalVisible(true);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        user: {
          id: 'currentUserId', // 当前用户的 ID
          nickname: '当前用户', // 当前用户的昵称
          avatar: 'https://picsum.photos/100/100?random=3', // 当前用户的头像
        },
        content: comment,
        createdAt: new Date().toISOString(),
        // date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        likes: 0,
      };
      setComments([newComment, ...comments]);
      setComment('');
      // Keyboard.dismiss();

      // const newComment = {
      //   id: Date.now().toString(),
      //   user: { name: '当前用户', avatar: 'https://example.com/current-user.jpg' },
      //   content: comment,
      //   date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      //   replies: []
      // };
      // // setComments([...comments, newComment]);
      // setComment('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* 作者信息 */}
        <View style={styles.headerContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={30} color="black" />
          </Pressable>
          <View style={styles.authorContainer}>
            <Image source={{ uri: diary.user.avatar }} style={styles.avatar} />
            <Text style={styles.nickname}>{diary.user.nickname}</Text>
          </View>
          <Pressable style={styles.statItem} onPress={handleShare}>
            <Ionicons name="share-social-outline" style={styles.statIcon} />
            <Text style={styles.statValue}>分享</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollArea}>
          <View>
            {/* 图片轮播区域 */}
            <View>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={{ width: screenWidth, height: 300 }}
                  />
                )}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ref={flatListRef}
              />
              {/* 小圆点指示器 */}
              {images.length > 1 && (<View style={styles.indicatorContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      currentImageIndex === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>)}
            </View>

            {/*地点标记*/}
            {!!(diary.tags) && <TouchableOpacity style={styles.tags} onPress={handleTagPress}>
              <View style={styles.tagContainer}>
                <Ionicons name="location-outline" size={12} color="#000" />
                <Text style={styles.tagText}>
                  {diary.tags.length > 1 ?
                    `${diary.tags[0].name}等`
                    : diary.tags[0].name
                  }
                </Text>
                <Ionicons name="chevron-forward" size={12} color="#000" />
              </View>
            </TouchableOpacity>}

            {/*游记标签*/}
            {!!(diary.When) && <View style={styles.infoBox}>
              <Text style={styles.infoItem}>出发时间{"\n"}<Text style={styles.infoBold}>{diary.When}</Text></Text>
              <Text style={styles.infoItem}>行程天数{"\n"}<Text style={styles.infoBold}>{diary.Days}</Text></Text>
              <Text style={styles.infoItem}>人均花费{"\n"}<Text style={styles.infoBold}>{diary.Money}</Text></Text>
              <Text style={styles.infoItem}>和谁出行{"\n"}<Text style={styles.infoBold}>{diary.Who}</Text></Text>
            </View>}

            {/* 游记内容 */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{diary.title}</Text>
              <Text style={styles.content}>{diary.content}</Text>
              <View style={styles.otherInfo}>
                <Text style={styles.time}>{new Date(diary.createTime).toLocaleDateString()}</Text>
                <Text style={styles.location}>{diary.location}</Text>
              </View>
            </View>

            {/* 地点详情弹窗 */}
            {!!(diary.tags) && <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>提及目的地 ({diary.tags.length})</Text>
                    <Pressable onPress={() => setModalVisible(false)}>
                      <Ionicons name="close-outline" size={24} color="#555" />
                    </Pressable>
                  </View>

                  {diary.tags.map((tag, index) => {
                    const info = {
                      image: tag.image,
                      suggestion: tag.suggestion,
                      url: tag.url,
                    };

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.destCard}
                        onPress={() => {
                          setModalVisible(false);
                          Linking.openURL(info.url);
                        }}
                      >
                        <Image source={{ uri: info.image }} style={styles.destImage} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.destName}> {tag.name}· 攻略</Text>
                          {info.suggestion ? (
                            <Text style={styles.destSuggestion}>{info.suggestion}</Text>
                          ) : null}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Modal>}



            {/* 新增的评论区 */}
            {!!(comments) && <View style={styles.commentsSection}>
              {/* 评论区标题 */}
              {!!(comments) && <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>共 {comments.length} 条评论</Text>
              </View>}

              {/* 评论列表 */}
              {comments.length > 0 ? (
                <CommentsList comments={comments} />
              ) : (
                <Text style={styles.noCommentsText}>暂无评论</Text>
              )}
            </View>}
          </View>
        </ScrollView>

        {/* 底部固定功能栏 */}
        {/* <View style={styles.footer}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" style={styles.statIcon} />
          <Text style={styles.statValue}>{diary.views}</Text>
        </View>

        <Pressable style={styles.statItem} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            style={[styles.statIcon, liked && { color: 'red' }]}
          />
          <Text style={styles.statValue}>{likesCount}</Text>
        </Pressable>

        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" style={styles.statIcon} />
          <Text style={styles.statValue}>{diary.comments}</Text>
        </View>
      </View> */}
        <View style={styles.footer}>
          <TextInput
            style={styles.commentInput}
            placeholder="说点什么..."
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.actionButton} onPress={handleSendComment}>
            <Ionicons name="send" size={20} color="#1E95D4" />
          </TouchableOpacity>

          <Pressable style={styles.statItem} onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              style={[styles.statIcon, liked && { color: 'red' }]}
            />
            <Text style={styles.statValue}>{likesCount}</Text>
          </Pressable>

          <Pressable style={styles.statItem} onPress={handleCollect}>
            <Ionicons
              name={collected ? 'star' : 'star-outline'}
              style={[styles.statIcon, collected && { color: "#F0C645" }]}
            />
            <Text style={styles.statValue}>{collectsCount}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    // marginBottom: 60
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  statValue: {
    fontSize: 12,
  },
  scrollArea: {
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  tags: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  infoItem: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoBold: {
    fontWeight: 'bold',
  },
  contentContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  otherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  destImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  destName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  destSuggestion: {
    fontSize: 12,
    color: '#666',
  },
  commentsSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  commentsHeader: {
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  actionButton: {
    padding: 8,
  },
});