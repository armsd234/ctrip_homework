import { StyleSheet, View, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import myDiaries from '@/data/myDiaries.json';
import StatusFilter from '@/components/StatusFilter';
import DiaryCard from '@/components/DiaryCard';

// 模拟当前登录用户
const CURRENT_USER_ID = 1;

export default function MyDiaryScreen() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [diaries] = useState<TravelDiary[]>(myDiaries.diaries as TravelDiary[]);
  const router = useRouter();

  // 根据状态筛选游记
  const filteredDiaries = diaries.filter(diary => 
    selectedStatus === 'all' || diary.status === selectedStatus
  );

  const handlePressDiary = (diary: TravelDiary) => {
    router.push(`/diary/${diary.id}`);
  };

  const handleEditDiary = (diary: TravelDiary) => {
    console.log('编辑游记:', diary.id);
  };

  const handleDeleteDiary = (diary: TravelDiary) => {
    console.log('删除游记:', diary.id);
  };

  return (
    <View style={styles.container}>
      <StatusFilter 
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <ScrollView style={styles.listContainer}>
        {filteredDiaries.map(diary => (
          <View key={diary.id}>
            <DiaryCard
              diary={diary}
              onPress={handlePressDiary}
              onEdit={handleEditDiary}
              onDelete={handleDeleteDiary}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
    padding: 12,
  },
});
