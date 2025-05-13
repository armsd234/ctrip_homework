import React, { useState } from 'react';
import { StyleSheet, View, 
  Image, Text, TouchableOpacity, Dimensions, Pressable, Modal, KeyboardAvoidingView, TextInput, Platform, FlatList, Share } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import travelDiaries from '@/data/travelDiaries.json';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';

const { width, height } = Dimensions.get('window');
type Comment = {
  id: string;
  user: string;
  content: string;
  time: string;
};

const mockComments: Comment[] = [
  { id: '1', user: '用户A', content: '这个视频太棒了！', time: '10分钟前' },
  { id: '2', user: '用户B', content: '我也喜欢这个内容', time: '30分钟前' },
  { id: '3', user: '用户C', content: '感谢分享，学到了很多', time: '1小时前' },
];

const videoSource = require('../../assets/videos/IMG_6128.mp4'); // 本地视频文件路径

const VideoDetailScreen = () => {
  const id = 1;
  const diary = travelDiaries.diaries.find(d => d.id === Number(id)) as unknown as TravelDiary;

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  // const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
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

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentUser}>{item.user}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTime}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={30} color="white" />
          </Pressable>
          <View style={styles.authorContainer}>
            <Image source={{ uri: diary.user.avatar }} style={styles.avatar} />
            <Text style={styles.nickname}>rabbit</Text>
          </View>
          <Pressable style={styles.statItem} onPress={handleShare}>
            <Ionicons name="share-social-outline" style={styles.statIcon} />
            <Text style={styles.statValue}>分享</Text>
          </Pressable>
        </View>

        {/* 全屏视频 */}
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />

        {/* 底部标题和描述 */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Big Buck Bunny</Text>
          <Text style={styles.description}>A large and lovable rabbit deals with three tiny bullies...</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
    // marginBottom: 60
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'black',
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
    bottom: 20,
    left: 10,
    right: 10, // 为右侧按钮留出空间
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
    bottom: 80,
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

export default VideoDetailScreen;
