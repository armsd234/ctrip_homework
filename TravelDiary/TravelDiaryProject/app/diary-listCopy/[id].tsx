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
import { TravelDiary } from '@/components/TravelDiaryMasonryCopy/types';
import travelDiaries from '@/data/travelDiaries.json';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommentsList from '@/components/Comments';
import { api } from '@/services/api';
// import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';

const { width: screenWidth } = Dimensions.get('window');

export default function DiaryListDetailScreen() {
 
  // const convertToTravelDiary = (data: any[]): TravelDiary[] => {
  //   return data.map(item => ({
  //     id: item._id, 
  //     title: item.title,
  //     content: item.content,
  //     coverImage: item.images.map((image: any) => `http://localhost:5001/api/images/image?filename=${image}`), 
  //     video: item.video,
  //     duration: 0,
  //     type: item.video ? 'video' : 'image',
  //     tags: item.tags?.map((tag: string) => ({ id: tag, name: tag })) || [],
  //     When: item.when,
  //     Who: item.who,
  //     Days: item.days,
  //     Money: item.money,
  //     user: {
  //       id: item.author._id,
  //       nickname: item.author.nickname,
  //       avatar: `http://localhost:5001/api/images/image?filename=${item.author.avatar}`
  //     },
  //     likes: item.likesCount,
  //     collects: item.favoriteCount,
  //     comments: item.commentCount,
  //     views: item.views,
  //     location: item.location,
  //     createTime: item.createdAt,
  //     status: item.status as 'pending' | 'approved' | 'rejected',
  //     rejectReason: item.rejectionReason,
  //     // tags?:Tag[];
  //     // commentsData?: CommentsData[];
  //   }));
  // };
  const { id } = useLocalSearchParams();
  const [diary, setDiary] = useState<TravelDiary | undefined>(undefined);
  console.log('Received diary id:', id); // 添加日志查看接收到的参数

  const convertResponseToTravelDiary = (responseData: any): TravelDiary => {
    const data = responseData.data[0];
    const defaultTags = [
      {
        name: "巴厘岛",
        image: "https://picsum.photos/400/300?random=10",
        suggestion: "建议游玩时间3-5天",
        url: "https://you.ctrip.com/place/bali438.html"
      },
      {
        name: "佩妮达岛",
        image: "https://picsum.photos/400/300?random=11",
        suggestion: "建议游玩时间3-5天",
        url: "https://you.ctrip.com/sight/bali438/64465.html?scene=online"
      },
      {
        name: "巴厘岛",
        image: "https://picsum.photos/400/300?random=12",
        suggestion: "",
        url: "https://you.ctrip.com/place/bali438.html"
      }
    ];

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      coverImage: data.coverImage.map((image: string) => `http://localhost:5001/api/images/image?filename=${image}`),
      video: data.video ? `http://localhost:5001/api/images/video?filename=${data.video}` : undefined,
      duration: data.duration ? parseInt(data.duration) : 0,
      type: data.video ? 'video' : 'image',
      tags: data.tags?.length > 0 ? data.tags : defaultTags,
      When: data.When,
      Who: data.Who,
      Days: data.Days,
      Money: data.Money,
      user: {
        id: data.user.id,
        nickname: data.user.nickname,
        avatar: `http://localhost:5001/api/images/image?filename=${data.user.avatar}`
      },
      likes: data.likes,
      collects: data.collects,
      comments: data.comments,
      views: data.views,
      location: data.location,
      createTime: data.createTime,
      status: 'approved',
      commentsData: data.commentsData || []
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('Received diary id:', id); 
      const response = await api.get(`/api/travel-notes/${id}`);
      console.log('Response:', response.data);
      const convertedDiary = convertResponseToTravelDiary(response.data);
      console.log('Converted diary:', convertedDiary);
      setDiary(convertedDiary);
    };
    fetchData();
  }, [id]);
  
  // const diary = travelDiaries.diaries.find(d => d.id.toString() === '1') as unknown as TravelDiary;
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [collectsCount, setCollectsCount] = useState(0);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (diary?.commentsData) {
      setComments(diary.commentsData);
    }
  }, [diary]);

  // 在获取到游记数据后更新点赞和收藏数
  useEffect(() => {
    if (diary) {
      setLikesCount(diary.likes || 0);
      setCollectsCount(diary.collects || 0);

      // 检查用户交互状态
      const checkUserInteractions = async () => {
        try {
          // 检查点赞状态
          const likeResponse = await api.get(`/api/travel-notes/${id}/like/check`);
          setLiked(likeResponse.data.hasLiked);
          
          // 检查收藏状态
          const collectResponse = await api.get(`/api/travel-notes/${id}/favorite/check`);
          setCollected(collectResponse.data.hasFavorited);
          console.log('Liked',liked);
          console.log('collected',collected);
        } catch (error) {
          console.error('检查用户交互状态失败:', error);
        }
      };
      
      checkUserInteractions();
    }
  }, [diary, id]);

  // 加载评论列表
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/api/comments/${id}`);
        
        // 转换评论数据格式
        const formattedComments = response.data.map((comment: any) => ({
          id: comment._id,
          content: comment.content,
          user: {
            id: comment.author._id,
            nickname: comment.author.nickname,
            avatar: `http://localhost:5001/api/images/image?filename=${comment.author.avatar}`
          },
          createdAt: comment.createdAt,
          likes: comment.likesCount || 0
        }));

        setComments(formattedComments);
      } catch (error) {
        console.error('加载评论失败:', error);
      }
    };

    if (diary) {
      fetchComments();
    }
  }, [diary, id]);

  const handleLike = async () => {
    try {
      if (!liked) {
        // 点赞
        await api.post(`/api/travel-notes/${id}/like`);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        // 取消点赞
        await api.delete(`/api/travel-notes/${id}/like`);
        setLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('请先登录');
      } else {
        console.error('点赞操作失败:', error);
        alert(error.response?.data?.message || '操作失败');
      }
    }
  };

  const handleCollect = async () => {
    try {
      if (!collected) {
        // 收藏
        await api.post(`/api/travel-notes/${id}/favorite`);
        setCollected(true);
        setCollectsCount(prev => prev + 1);
      } else {
        // 取消收藏
        await api.delete(`/api/travel-notes/${id}/favorite`);
        setCollected(false);
        setCollectsCount(prev => prev - 1);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('请先登录');
      } else {
        console.error('收藏操作失败:', error);
        alert(error.response?.data?.message || '操作失败');
      }
    }
  };

  const handleShare = async () => {
    if (!diary) return;
    
    try {
      const result = await Share.share({
        message: `快来看看这篇游记：${diary.title} 👉 ${diary.location || '未知地点'}`,
        url: 'http://127.0.0.1:8081/diary-list/' + diary.id,
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

  const handleSendComment = async () => {
    if (comment.trim()) {
      try {
        // 发送评论到后端
        const response = await api.post(`/api/comments/${id}`, {
          content: comment.trim()
        });

        // 转换后端返回的评论数据格式
        const newComment = {
          id: response.data._id,
          content: response.data.content,
          user: {
            id: response.data.author._id,
            nickname: response.data.author.nickname,
            avatar: `http://localhost:5001/api/images/image?filename=${response.data.author.avatar}`
          },
          createdAt: response.data.createdAt,
          likes: 0
        };

        // 更新本地评论列表
        setComments(prevComments => [newComment, ...prevComments]);
        setComment('');
        Keyboard.dismiss();

        // 更新评论总数
        if (diary) {
          setDiary({
            ...diary,
            comments: diary?.comments ? diary.comments + 1 : 1
          });
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          alert('请先登录后再评论');
        } else {
          console.error('发送评论失败:', error);
          alert(error.response?.data?.message || '评论失败');
        }
      }
    }
  };

  if (!diary) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={30} color="black" />
              </Pressable>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>加载中</Text>
              </View>
      
            </SafeAreaView>
    );
  }

  // 统一 coverImage 为数组
  const images = Array.isArray(diary.coverImage)
    ? diary.coverImage
    : [diary.coverImage];

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
            {diary?.tags && diary.tags.length > 0 && (
              <TouchableOpacity style={styles.tags} onPress={handleTagPress}>
                <View style={styles.tagContainer}>
                  <Ionicons name="location-outline" size={12} color="#000" />
                  <Text style={styles.tagText}>
                    {diary.tags.length > 0 
                      ? `${diary.tags[0]?.name || '未知地点'}等`
                      : diary.tags[0]?.name || '未知地点'
                    }
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color="#000" />
                </View>
              </TouchableOpacity>
            )}

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
            {diary?.tags && diary.tags.length > 0 && (
              <Modal
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
                        image: tag?.image || '',
                        suggestion: tag?.suggestion || '',
                        url: tag?.url || '',
                      };

                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.destCard}
                          onPress={() => {
                            setModalVisible(false);
                            if (info.url) {
                              Linking.openURL(info.url);
                            }
                          }}
                        >
                          {info.image && (
                            <Image source={{ uri: info.image }} style={styles.destImage} />
                          )}
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.destName}>{tag?.name || '未知地点'}· 攻略</Text>
                            {info.suggestion && (
                              <Text style={styles.destSuggestion}>{info.suggestion}</Text>
                            )}
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </Modal>
            )}



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

          <Pressable 
            style={[styles.statItem, liked && styles.likedItem]} 
            onPress={handleLike}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? '#FF4D4F' : '#666'}
            />
            <Text style={[styles.statValue, liked && styles.likedText]}>
              {likesCount}
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.statItem, collected && styles.collectedItem]} 
            onPress={handleCollect}
          >
            <Ionicons
              name={collected ? 'star' : 'star-outline'}
              size={24}
              color={collected ? '#F0C645' : '#666'}
            />
            <Text style={[styles.statValue, collected && styles.collectedText]}>
              {collectsCount}
            </Text>
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
    position: 'relative'
    // paddingBottom: 60, // 为底部栏预留空间
  },
  scrollArea: {
    flex: 1,
    // backgroundColor: 'white',
    marginBottom: 60
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  authorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nickname: {
    height: 40,
    lineHeight: 40,
    fontSize: 20,
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#333',
    width: 10,
    height: 10,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: 'white',
    // marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tags: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginLeft: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    backgroundColor: '#c3d0dd',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 20
  },
  tagText: {
    color: 'black',
    fontSize: 12,
    marginLeft: 4,
    marginRight: 4,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f3f7ff',
    margin: 12,
    borderRadius: 10,
    paddingVertical: 10,
  },
  infoItem: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  infoBold: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  otherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  time: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 12,
    marginRight: 12
    // padding: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  likedItem: {
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
  },
  collectedItem: {
    backgroundColor: 'rgba(240, 198, 69, 0.1)',
  },
  statIcon: {
    fontSize: 24,
    color: '#666',
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  likedText: {
    color: '#FF4D4F',
  },
  collectedText: {
    color: '#F0C645',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f7fafe',
    marginBottom: 12,
  },
  destImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  destName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  destSuggestion: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  commentsSection: {
    marginLeft: 20,
    marginRight: 20,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  commentsHeader: {
    // paddingTop: 16,
    marginTop: 20,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noCommentsText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  }
});