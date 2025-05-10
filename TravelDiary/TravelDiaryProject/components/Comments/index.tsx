import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';

// 用户信息接口
interface User {
  id: string;
  nickname: string;
  avatar: string;
  isAuthor?: boolean;
}

// 评论基础接口
interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string; // ISO 8601 格式日期字符串
  likes: number;
  replies?: Comment[]; // 可选的回评论数组
}

export default function CommentsList({ comments }: { comments: Comment[] }) {
  const CommentItem = ({ comment }: { comment: any }) => {
    return (
      <View style={styles.commentContainer}>
        <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.userName}>
              {comment.user.nickname}
            </Text>
            <Text style={styles.commentTime}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.commentText}>{comment.content}</Text>

          {/* 回复内容 */}
          {/* <View>
            {comments.map(item => (
              <CommentItem key={item.id} comment={item} />
            ))}
          </View> */}

          {/* 如果注释本段代码，但不注释上一段，内存会爆炸 */}
          {/* {comment.replies.map((
            reply) => (
            <View key={reply.id} style={styles.replyContainer}>
              <Image source={{ uri: reply.user.avatar }} style={styles.replyAvatar} />
              <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                  <Text style={reply.user.isAuthor ? styles.authorName : styles.userName}>
                    {reply.user.name}
                  </Text>

                  <Text style={styles.commentTime}>{reply.date}</Text>
                </View>
                <Text style={styles.commentText}>{reply.content}</Text>
              </View>
            </View>
          ))} */}

          {/* 回复按钮 */}
          {/* <TouchableOpacity style={styles.replyButton}>
            <Text style={styles.replyButtonText}>回复</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  return (
    <View>
      {comments.map(item => (
        <CommentItem key={item.id} comment={item} />
      ))}
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
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
  commentsHeader: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  authorName: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  replyButtonText: {
    color: '#666',
    fontSize: 13,
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
    marginRight: 10,
  },
  actionButton: {
    marginLeft: 12,
    padding: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    color: '#666',
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#333',
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
  commentsSection: {
    marginLeft: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  // commentsTitle: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginBottom: 12,
  //   color: '#333',
  // },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  noCommentsText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  }
});