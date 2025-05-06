import travelDiaries from '@/data/travelDiaries.json';
import { TravelDiary } from '@/components/TravelDiaryMasonry/types';

// 获取游记列表
export const getTravelDiaries = (page: number = 1, pageSize: number = 10): Promise<TravelDiary[]> => {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const diaries = travelDiaries.diaries.slice(start, end);
      resolve(diaries);
    }, 500);
  });
};

// 获取单个游记详情
export const getTravelDiaryById = (id: number): Promise<TravelDiary | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const diary = travelDiaries.diaries.find(d => d.id === id);
      resolve(diary);
    }, 300);
  });
}; 