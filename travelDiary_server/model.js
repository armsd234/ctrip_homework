const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);



const userSchema = new Schema({

    username: { type: String, required: true }, // 用户名字段
    password: { type: String, required: true }, // 密码字段
    nickname: { type: String, required: true }, // 昵称字段
    email: { type: String, required: true },     // 邮箱字段

    avatar: { type: String, default: 'default_avatar.jpg' }, // 头像字段，默认为 'default.jpg'
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' }, // 性别字段，默认为 'other'
    birthday: { type: Date }, // 生日字段，默认为当前日期

    signature: { type: String, default: '这个人很懒，什么都没有留下。' }, // 个性签名字段，默认为 '这个人很懒，什么都没有留下。'
    status: { type: String, enum: ['online', 'offline', 'busy'], default: 'online' }, // 状态字段，默认为 'online'

    backgroundImage: { type: String, default: 'default_bg.jpg' }, // 背景图片字段，默认为 'default_bg.jpg'
    followers: { type: Number, default: 0 }, // 关注者数量字段，默认为 0
    following: { type: Number, default: 0 }, // 关注的人数字段，默认为 0
    posts: { type: Number, default: 0 }, // 发布的文章数量字段，默认为 0
    likeds: { type: Number, default: 0 }, // 收到的赞数量字段，默认为 0
});

module.exports = {
    User,

};
