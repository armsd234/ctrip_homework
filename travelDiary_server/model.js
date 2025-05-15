const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//生成全局唯一id
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// 用户
const UserSchema = new Schema({
  username: { type: String, required: true }, // 用户名字段
  password: { type: String, required: true }, // 密码字段
  nickname: { type: String, required: true }, // 昵称字段
  email: { type: String },     // 邮箱字段

  avatar: { type: String, default: 'default_avatar.jpg' }, // 头像字段，默认为 'default.jpg'
  gender: { type: String, enum: ['male', 'female'], default: 'male' }, // 性别字段，默认为 'other'
  birthday: { type: Date }, // 生日字段，默认为当前日期

  signature: { type: String, default: '这个人很懒，什么都没有留下。' }, // 个性签名字段，默认为 '这个人很懒，什么都没有留下。'
  status: { type: String, enum: ['online', 'offline', 'busy'], default: 'online' }, // 状态字段，默认为 'online'

  backgroundImage: { type: String, default: 'default_bg.jpg' }, // 背景图片字段，默认为 'default_bg.jpg'
  location: { type: String }, // 位置字段
  // 统计字段
  posts: { type: Number, default: 0 }, // 发布的文章数量字段，默认为 0
  likeds: { type: Number, default: 0 }, // 被赞数量字段，默认为 0
  followers: { type: Number, default: 0 }, // 粉丝数量字段，默认为 0
  followings: { type: Number, default: 0 }, // 关注的用户数量字段，默认为 0
  favoriteds: { type: Number, default: 0 }, // 被收藏的文章数量字段，默认为 0

  createdAt: { type: Date, default: Date.now }, // 创建时间字段，默认为当前时间

  role: { type: String, enum: ['user', 'admin', 'reviewer'], default: 'user' }, // 角色字段，默认为 'user'
});
const User = mongoose.model('User', UserSchema);

//关注
const FollowSchema = new mongoose.Schema({
  id: { type: Number },
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 粉丝ID字段，引用User模型
  followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 被关注的用户ID字段，引用User模型
  createdAt: { type: Date, default: Date.now } // 创建时间字段，默认为当前时间
})
const Follow = mongoose.model('Follow', FollowSchema);

// 标签
const TagSchema = new mongoose.Schema({
  tid: { type: Number },
  name: { type: String, required: true }, // 标签名字段
  image: { type: String, required: true }, // 标签图片字段
  suggestion: { type: String }, // 建议字段
  url: { type: String, required: true }, // 链接字段
  id: { type: Number },
})
const Tag = mongoose.model('Tag', TagSchema);

// 游记
const TravelNoteSchema = new mongoose.Schema({
  id: { type: Number },
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: { type: [String] }, // 存储图片URL数组
  video: { type: String }, // 存储视频URL ,default: '1747059904050-c667724fd0e22e0648bb78adfbdc9406.mp4' 
  location: { type: String, default: '中国-南京' }, // 存储位置信息
  duration: { type: Number, default: 0 }, // 存储持续时间

  when: { type: String, default: '二月' },     // 时间字段
  days: { type: String, default: '3天' },     // 天数字段
  money: { type: String, default: '10K' },     // 金额字段
  who: { type: String, default: '家人' },     // 谁字段
  category: { type: String, enum: ['旅行', '文化', '美食', '生活', '其他'], default: '旅行' }, // 分类

  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],


  isPublic: { type: Boolean, default: true }, // 是否公开
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  rejectionReason: { type: String }, // 审核拒绝原因
  views: { type: Number, default: 0 }, // 浏览量
  commentCount: { type: Number, default: 0 }, // 评论数

  likes: { type: Number, default: 0 }, // 点赞数

  favoriteCount: { type: Number, default: 0 }, // 收藏数

  isDeleted: { type: Boolean, default: false }, // 逻辑删除标记
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const TravelNote = mongoose.model('TravelNote', TravelNoteSchema);

// 审核日志
const ReviewLogSchema = new mongoose.Schema({
  id: { type: Number },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['approve', 'reject', 'delete'], required: true },
  reason: { type: String }, // 拒绝或删除原因
  createdAt: { type: Date, default: Date.now }
});
const ReviewLog = mongoose.model('ReviewLog', ReviewLogSchema);

// 评论
const CommentSchema = new mongoose.Schema({
  id: { type: Number },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },

  //回复
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // 子评论ID数组，引用Comment模型
  replyCount: { type: Number, default: 0 }, // 回复数
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // 父评论ID，引用Comment模型

  //点赞
  likesCount: { type: Number, default: 0 }, // 点赞数
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});
const Comment = mongoose.model('Comment', CommentSchema);

// 收藏
const FavoriteSchema = new mongoose.Schema({
  id: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },
  createdAt: { type: Date, default: Date.now }
});
const Favorite = mongoose.model('Favorite', FavoriteSchema);

//点赞
const LikeSchema = new mongoose.Schema({
  id: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },
  createdAt: { type: Date, default: Date.now }
})
const Like = mongoose.model('Like', LikeSchema);



// 举报记录
const ReportSchema = new mongoose.Schema({
  id: { type: Number },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote' },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', ReportSchema);

module.exports = {
  User,
  TravelNote,
  ReviewLog,
  Comment,
  Favorite,
  Tag,
  Like,
  Follow,
  Report
};
