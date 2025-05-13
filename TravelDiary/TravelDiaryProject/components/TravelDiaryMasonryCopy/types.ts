// 单个游记数据类型
export interface Tag {
  name: string;
  image: string;
  suggestion: string;
  url: string;
}

// 用户信息接口
interface User {
  id: string;
  nickname: string;
  avatar: string;
}

// 评论基础接口
interface Comment {
  id: string;
  content: string;
  createdAt: string; // ISO 8601 格式日期字符串
  user: User;
  likes: number;
}

// 带回复的评论接口（扩展基础接口）
interface CommentsData extends Comment {
  replies?: Comment[]; // 可选的回评论数组
}

export interface TravelDiary {
  id: string;
  title: string;
  content: string;
  coverImage?: string[]|string; //封面图片
  video?: string; //视频
  duration?: number; //视频时长(秒)
  type: 'image' | 'video'; //类型
  tags?:Tag[];
  When?:string;
  Who?:string;
  Days?:string;
  Money?:string;
  user: {
    id: string;
    nickname: string;
    avatar: string;
  };
  likes: number; //点赞数
  collects:number;
  comments: number; //评论数
  views: number;
  location: string;
  createTime: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  
  commentsData?: CommentsData[];
}

// types.ts
// export type TravelDiary = {
//   id: string;
//   title: string;
//   user: {
//     id: string;
//     nickname: string;
//     avatar: string;
//   };
//   likes: number;
//   createdAt: string;
// } & (
//   | {
//       type: 'image';
//       images: string[]; // 图片数组
//       coverImage: string; // 封面图
//     }
//   | {
//       type: 'video';
//       video: string; // 视频URL
//       coverImage: string; // 视频封面
//       duration?: number; // 视频时长(秒)
//     }
// );

// 多个游记的瀑布流
export interface TravelDiaryMasonryProps {
  diaries: TravelDiary[];  //游记数据列表
  loading: boolean;  //加载状态
  searching: boolean;  //加载状态
  onLoadMore?: () => void;  //加载事件
  onPressItem?: (diary: TravelDiary) => void;  //点击事件
} 