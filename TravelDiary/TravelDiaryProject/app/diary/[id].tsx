import { StyleSheet, View, ScrollView, Image, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import myDiaries from '@/data/myDiaries.json';
import { Ionicons } from '@expo/vector-icons';
import StatusTag from '@/components/StatusTag';

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const diary = myDiaries.diaries.find(d => d.id === Number(id)) as TravelDiary;

  if (!diary) {
    return (
      <View style={styles.container}>
        <Text>未找到该游记</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        
      {/* 作者信息和返回按钮 */}
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </Pressable>
        <View style={styles.authorContainer}>
          <Image source={{ uri: diary.user.avatar }} style={styles.avatar} />
            <Text style={styles.nickname}>{diary.user.nickname}</Text>
        </View>
      </View>

      {/* 游记图片 */}
      <Image 
        source={{ uri: diary.coverImage }} 
        style={styles.coverImage}
      />

      {/* 游记内容 */}
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{diary.title}</Text>
          <StatusTag status={diary.status} />
        </View>
        <Text style={styles.content}>{diary.content}</Text>
        <View style={styles.otherInfo}>
          <Text style={styles.time}>{new Date(diary.createTime).toLocaleDateString()}</Text>
          <Text style={styles.location}>{diary.location}</Text>
        </View>
        {diary.status === 'rejected' && diary.rejectReason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionTitle}>审核未通过原因</Text>
            <Text style={styles.rejectionReason}>{diary.rejectReason}</Text>
          </View>
        )}
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{diary.views}</Text>
          <Text style={styles.statLabel}>浏览</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{diary.likes}</Text>
          <Text style={styles.statLabel}>点赞</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{diary.comments}</Text>
          <Text style={styles.statLabel}>评论</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    // marginBottom: 4,
  },
  authorInfo: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  otherInfo: {
    flex: 1,
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
    // marginBottom: 16,
  },
  rejectionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4d4f',
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
}); 