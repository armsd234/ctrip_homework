import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Dimensions, Pressable, Modal, KeyboardAvoidingView, TextInput, Platform, FlatList, Share } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import travelDiaries from '@/data/videoDiaries.json';

const { width, height } = Dimensions.get('window');
type Comment = {
  id: string;
  user: string;
  content: string;
  time: string;
};

// 用户信息接口
interface User {
  id: string;
  nickname: string;
  avatar: string;
}

interface VideoItem {
  id: string;
  uri: string;
  title: string;
  description: string;
  likes: number;
  comments: Comment[];
  user: User;
}

const mockComments: Comment[] = [
  { id: '1', user: '用户A', content: '这个视频太棒了！', time: '10分钟前' },
  { id: '2', user: '用户B', content: '我也喜欢这个内容', time: '30分钟前' },
  { id: '3', user: '用户C', content: '感谢分享，学到了很多', time: '1小时前' },
];

const VideoDetailScreen = () => {
  // 获取视频列表
  const videoList: VideoItem[] = travelDiaries.diaries.map((diary: any) => ({
    id: diary.id.toString(),
    uri: diary.videoSource,
    title: diary.title,
    description: diary.description,
    likes: 0, // Default value
    comments: [], // Default value
    user: {
      id: diary.user.id || 'unknown',
      nickname: diary.user.nickname,
      avatar: diary.user.avatar,
    },
  }));
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // 当前视频
  const currentVideo = videoList[currentIndex];

  // 播放当前视频
  const video = require('../../assets/videos/IMG_6128.mp4');
  const player = useVideoPlayer(video, player => {
    player.loop = true;
    player.play();
  });

  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(),
        user: '当前用户',
        content: commentText,
        time: '刚刚'
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentUser}>{item.user}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTime}>{item.time}</Text>
    </View>
  );

  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const height = event.nativeEvent.layoutMeasurement.height;
    const index = Math.floor(contentOffsetY / height);
    setCurrentIndex(index);
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <View style={styles.container}>

      {/* 全屏视频 */}
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />

      {/* 底部标题和描述 */}
      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.authorContainer}>
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            <Text style={styles.nickname}>rabbit</Text>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>



      {/* 右侧操作按钮 */}
      <View style={styles.actionContainer}>
        <Pressable style={styles.actionButton} onPress={() => setIsLiked(!isLiked)}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            style={[styles.actionIcon, isLiked && { color: 'red' }]}
          />
          <Text style={styles.actionText}>34</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => setIsFavorited(!isFavorited)}>
          <Ionicons
            name={isFavorited ? 'star' : 'star-outline'}
            style={[styles.actionIcon, isFavorited && { color: "#F0C645" }]}
          />
          <Text style={styles.actionText}>11</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => setIsCommentModalVisible(true)}>
          <Ionicons
            name='chatbubble-ellipses-outline'
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>11</Text>
        </Pressable>
      </View>

      {/* 评论弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentModalVisible}
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>评论 ({comments.length})</Text>
              <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                <Text style={styles.closeButton}>关闭</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              renderItem={renderCommentItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.commentList}
              inverted
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.commentInputContainer}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="写下你的评论..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Text style={styles.sendButtonText}>发送</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={videoList}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}

        // onScroll={handleScroll}
        // scrollEnabled={false} // 禁用 FlatList 的滑动，通过外部控制
        // pagingEnabled // 启用分页滚动

        snapToInterval={height}
        decelerationRate="fast"
        // onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 300,
        }}
        initialScrollIndex={currentIndex}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

export default VideoDetailScreen;


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
    // marginBottom: 60
  },
  container: {
    height: height,
    width: width,
    backgroundColor: 'black',
    paddingBottom: 200,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'black',
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
    color: 'white',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  statIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    color: 'white',
  },
  video: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 160,
    left: 10,
    right: 50, // 为右侧按钮留出空间
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: 'white',
    fontSize: 14,
  },
  actionContainer: {
    position: 'absolute',
    right: 20,
    bottom: 180,
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    color: 'white',
    marginBottom: 5,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  commentList: {
    paddingBottom: 15,
  },
  commentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentContent: {
    marginBottom: 5,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  sendButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
