// 单个游记数据类型
export interface Tag {
  name: string;
  image: string;
  suggestion: string;
  url: string;
}
export interface TravelDiary {
  id: number;
  title: string;  //标题
  coverImage?: string[]|string; //封面图片
  tags?:Tag[];
  When?:string;
  Who?:string;
  Days?:string;
  Money?:string;
  user: {
    id: number;
    nickname: string;
    avatar: string;
  };
  likes: number; //点赞数
  comments: number; //评论数
  views: number;
  location: string;
  createTime: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  content: string;
}

// 多个游记的瀑布流
export interface TravelDiaryMasonryProps {
  diaries: TravelDiary[];  //游记数据列表
  loading: boolean;  //加载状态
  onLoadMore: () => void;  //加载事件
  onPressItem?: (diary: TravelDiary) => void;  //点击事件
} 