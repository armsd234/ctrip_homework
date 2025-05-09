import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import travelDiaries from '@/data/travelDiaries.json';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function DiaryListDetailScreen() {
  const { id } = useLocalSearchParams();
  const diary = travelDiaries.diaries.find(d => d.id === Number(id)) as unknown as TravelDiary;
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(diary?.likes || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => prev + (liked ? -1 : 1));
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentImageIndex(index);
  };

  const handleTagPress = () => {
    setModalVisible(true);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
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
        </View>

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
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.tagText}>
            {diary.tags.length > 1 ? 
                `${diary.tags[0].name}等`
                :diary.tags[0].name
              }
          </Text>
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

        {/* 底部固定功能栏 */}
        <View style={styles.bottomBar}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" style={styles.statIcon} />
            <Text style={styles.statValue}>{diary.views}</Text>
          </View>

          <Pressable style={styles.statItem} onPress={toggleLike}>
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
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingBottom: 60, // 为底部栏预留空间
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
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  tagText: {
    color: '#555',
    fontSize: 14,
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
  bottomBar: {
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
});