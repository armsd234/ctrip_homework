import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { TravelDiary } from '../TravelDiaryMasonry/types';

interface StatusFilterProps {
  selectedStatus: 'all' | TravelDiary['status'];
  onStatusChange: (status: 'all' | TravelDiary['status']) => void;
}

export default function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <View style={styles.filterContainer}>
      {['all', 'pending', 'approved', 'rejected'].map((status) => (
        <Pressable
          key={status}
          style={[
            styles.filterItem,
            selectedStatus === status && styles.filterItemActive
          ]}
          onPress={() => onStatusChange(status as any)}
        >
          <Text style={[
            styles.filterText,
            selectedStatus === status && styles.filterTextActive
          ]}>
            {status === 'all' ? '全部' : 
             status === 'pending' ? '待审核' :
             status === 'approved' ? '已通过' : '未通过'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    height: 48,
    alignItems: 'center',
  },
  filterItem: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    height: 24,
    justifyContent: 'center',
  },
  filterItemActive: {
    backgroundColor: '#e3f2fd',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 