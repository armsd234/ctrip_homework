import { StyleSheet, View, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';
import myDiaries from '@/data/myDiaries.json';
import StatusFilter from '@/components/StatusFilter';
import DiaryCard from '@/components/DiaryCard';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';

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
    console.log('查看游记:', diary.id);
  };

  const handleEditDiary = (diary: TravelDiary) => {
    console.log('编辑游记:', diary.id);
    // router.push(`/diary/${diary.id}/edit`);
    // 未完成！！！
  };

  const handleDeleteDiary = async(id: number) => {
      try {
        const response = await api.post(`/api/travel-notes/:${id}`, {
          method: 'DELETE',
        });
        console.log('删除:', response);
  
        if (response.status === 201) {
          alert('游记已删除');
          router.push('/mydiary');
        }
      } catch (error) {
        console.error('删除失败:', error);
        alert('游记删除失败');
      }
    };

  return (
     <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      {/* <TouchableOpacity 
          onPress={handleSearchSubmit}
        >
                    <Ionicons name="search" size={20} color="blue" />
                    </TouchableOpacity> */}
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
              onDelete={()=>handleDeleteDiary(diary.id)}
            />
          </View>
        ))}
      </ScrollView>
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
  listContainer: {
    flex: 1,
    padding: 12,
  },
});
