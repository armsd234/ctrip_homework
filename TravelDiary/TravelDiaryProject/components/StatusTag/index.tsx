import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { TravelDiary } from '../TravelDiaryMasonry/types';

interface StatusTagProps {
  status: TravelDiary['status'];
}

export default function StatusTag({ status }: StatusTagProps) {
  const statusConfig = {
    pending: { text: '待审核', color: '#FFA500' },
    approved: { text: '已通过', color: '#4CAF50' },
    rejected: { text: '未通过', color: '#F44336' }
  };

  const config = statusConfig[status];
  return (
    <View style={[styles.statusTag, { backgroundColor: config.color }]}>
      <Text style={styles.statusText}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
}); 