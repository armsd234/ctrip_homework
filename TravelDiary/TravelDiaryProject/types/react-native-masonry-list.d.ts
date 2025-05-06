declare module 'react-native-masonry-list' {
  import { ComponentType } from 'react';
  import { ViewStyle } from 'react-native';

  interface MasonryListProps<T> {
    data: T[];
    renderItem: ({ item }: { item: T }) => React.ReactElement;
    keyExtractor: (item: T) => string;
    numColumns?: number;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    showsVerticalScrollIndicator?: boolean;
    style?: ViewStyle;
    ListFooterComponent?: ComponentType<any> | (() => React.ReactElement | null);
  }

  const MasonryList: <T>(props: MasonryListProps<T>) => React.ReactElement;
  export default MasonryList;
} 