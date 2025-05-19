import { StyleSheet, View, Pressable, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { TravelDiary } from '../TravelDiaryMasonry/types';
import StatusTag from '../StatusTag';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

interface DiaryCardProps {
  diary: TravelDiary;
  onPress?: (diary: TravelDiary) => void;
  onEdit?: (diary: TravelDiary) => void;
  onDelete?: (diary: TravelDiary) => void;
}

export default function DiaryCard({ diary, onPress, onEdit, onDelete }: DiaryCardProps) {
  const videoSource = diary.type === 'video' ? { uri: diary.video } : null;
  console.log('videoSource', videoSource);

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    // player.play();
  });  

  const handlePress = () => {
    if (onPress) {
      onPress(diary);
    } else {
      router.push(`/diary/${diary.id}`);
    }
  };

  // console.log('diary', diary);


  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={2}>{diary.title}</Text>
        <StatusTag status={diary.status} />
      </View>
      <View style={styles.cardContent}>
        {diary.type === 'image' && (
          <Image
            source={{ uri: Array.isArray(diary.coverImage) ? diary.coverImage[0] : diary.coverImage }}
            style={styles.coverImage}
          />
        )}
        {diary.type === 'video' && (
          <VideoView
            // ref={videoRef}
            player={player}
            style={styles.coverImage}
            // style={{ backgroundColor: 'pink', width: 80, height: 80, borderRadius: 8, marginRight: 12 }}
            allowsFullscreen = {false}
            nativeControls={false}
          />
        )}
        <View style={styles.contentInfo}>
          <Text style={styles.content} numberOfLines={2}>{diary.content}</Text>
          <Text style={styles.time} numberOfLines={1}>{new Date(diary.createTime).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.rejectReasonContainer}>
        {diary.status === 'rejected' && diary.rejectReason && (
          <View style={styles.rejectReason}>
            <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
            <Text style={styles.rejectReasonText} numberOfLines={1}>{diary.rejectReason}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onEdit?.(diary)}
          >
            <Ionicons name="create-outline" size={16} color="#2196F3" />
            <Text style={styles.actionText}>编辑</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete?.(diary)}
          >
            <Ionicons name="trash-outline" size={16} color="#F44336" />
            <Text style={[styles.actionText, styles.deleteText]}>删除</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  cardContent: {
    flexDirection: 'row',
    marginTop: 8,
  },
  coverImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 24,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  rejectReasonContainer: {
    flex: 1,
    marginTop: 10,
  },
  rejectReason: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  rejectReasonText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 4,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
  },
  deleteText: {
    color: '#F44336',
  },
}); 