const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 用户
const UserSchema = new Schema({
    username: { type: String, required: true }, // 用户名字段
    password: { type: String, required: true }, // 密码字段
    nickname: { type: String, required: true }, // 昵称字段
    email: { type: String },     // 邮箱字段

    avatar: { type: String, default: 'default_avatar.jpg' }, // 头像字段，默认为 'default.jpg'
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' }, // 性别字段，默认为 'other'
    birthday: { type: Date }, // 生日字段，默认为当前日期

    signature: { type: String, default: '这个人很懒，什么都没有留下。' }, // 个性签名字段，默认为 '这个人很懒，什么都没有留下。'
    status: { type: String, enum: ['online', 'offline', 'busy'], default: 'online' }, // 状态字段，默认为 'online'

    backgroundImage: { type: String, default: 'default_bg.jpg' }, // 背景图片字段，默认为 'default_bg.jpg'
    //关注列表
    follows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 关注的用户列表字段，默认为空数组
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 粉丝列表字段，默认为空数组
    // 统计字段
    posts: { type: Number, default: 0 }, // 发布的文章数量字段，默认为 0
    likeds: { type: Number, default: 0 }, // 收到的赞数量字段，默认为 0
    role: { type: String, enum: ['user', 'admin', 'reviewer'], default: 'user' }, // 角色字段，默认为 'user'
});

const User = mongoose.model('User', UserSchema);

// 游记
const TravelNoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }], // 存储图片URL数组
    video: { type: String }, // 存储视频URL
    location: { type: String }, // 存储位置信息
    tags: [{ type: String }], // 标签
    category: { type: String, enum: ['travel', 'culture', 'food', 'life', 'other'], default: 'other' }, // 分类
    isPublic: { type: Boolean, default: true }, // 是否公开
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    rejectionReason: { type: String }, // 审核拒绝原因
    views: { type: Number, default: 0 }, // 浏览量
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 点赞用户
    isDeleted: { type: Boolean, default: false }, // 逻辑删除标记
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
const TravelNote = mongoose.model('TravelNote', TravelNoteSchema);

// 审核日志
const ReviewLogSchema = new mongoose.Schema({
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['approve', 'reject', 'delete'], required: true },
    reason: { type: String }, // 拒绝或删除原因
    createdAt: { type: Date, default: Date.now }
  });
const ReviewLog = mongoose.model('ReviewLog', ReviewLogSchema);

// 评论
const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  });
const Comment = mongoose.model('Comment', CommentSchema);

// 收藏
const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelNote', required: true },
    createdAt: { type: Date, default: Date.now }
  });
const Favorite = mongoose.model('Favorite', FavoriteSchema);

module.exports = {
    User,
    TravelNote,
    ReviewLog,
    Comment,
    Favorite,
};
