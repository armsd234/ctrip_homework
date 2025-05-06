import { StyleSheet, View, ScrollView, Image, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import travelDiaries from '@/data/travelDiaries.json';
import { Ionicons } from '@expo/vector-icons';

export default function DiaryListDetailScreen() {

  // 获取游记id
  const { id } = useLocalSearchParams();
  const diary = travelDiaries.diaries.find(d => d.id === Number(id)) as TravelDiary;
  const router = useRouter();

  if (!diary) {
    return (
      <View style={styles.container}>
        <Text>未找到该游记</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
        
      {/* 作者信息 */}
      <View style={styles.headerContainer}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          {/* <Ionicons name="arrow-back" size={24} color="#333" /> */}
          {/* <Ionicons name="chevron-back" size={30} color="black" /> */}
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
        <Text style={styles.title}>{diary.title}</Text>
        <Text style={styles.content}>{diary.content}</Text>
        <View style={styles.otherInfo}>
          <Text style={styles.time}>{new Date(diary.createTime).toLocaleDateString()}</Text>
          <Text style={styles.location}>{diary.location}</Text>
        </View>
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" style={styles.statIcon}/>
          <Text style={styles.statValue}>{diary.views}</Text>
          {/* <Text style={styles.statLabel}>浏览</Text> */}
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" style={styles.statIcon}/>
          <Text style={styles.statValue}>{diary.likes}</Text>
          {/* <Text style={styles.statLabel}>点赞</Text> */}
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble-outline" style={styles.statIcon}/>
          <Text style={styles.statValue}>{diary.comments}</Text>
          {/* <Text style={styles.statLabel}>评论</Text> */}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
  // statItem: {
  //   alignItems: 'center',
  // },
  statValue: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#333',
    // marginBottom: 4,
  },
  statIcon: {
    fontSize: 24,
    color: '#666',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
}); 