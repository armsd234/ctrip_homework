const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
const { User,
    TravelNote,
    ReviewLog,
    Comment,
    Favorite,
    Tag,
    Like,
    Follow,} = require('./model');
const config = require('./config');

const authRoutes = require('./routes/auth');
const travelNoteRoutes = require('./routes/travel-notes');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const imageRoutes = require('./routes/images');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 初始化管理员和审核人员账号
async function initializeDatabase() {
    try {
        //清空数据库
        await mongoose.connection.dropDatabase();
        console.log('数据库已清空');

        // 创建管理员账号
        const adminHashedPassword = await bcrypt.hash(config.admin.password, 10);
        await User.create({
            ...config.admin,
            password: adminHashedPassword
        });
        console.log('管理员账号创建成功');

        // 创建审核人员账号
        const reviewerHashedPassword = await bcrypt.hash(config.reviewer.password, 10);
        await User.create({
            ...config.reviewer,
            password: reviewerHashedPassword
        });
        console.log('审核人员账号创建成功');

        // 创建普通用户账号
        const userHashedPassword = await bcrypt.hash(config.user1.password, 10);
        await User.create({
            ...config.user1,
            password: userHashedPassword
        });
        console.log('普通用户1账号创建成功');

        const userHashedPassword2 = await bcrypt.hash(config.user2.password, 10);
        await User.create({
            ...config.user2,
            password: userHashedPassword2
        });
        console.log('普通用户1账号创建成功');

        // 创建默认数据
        try {
            // 创建标签默认数据
            const tags = await Tag.create(config.tags);
            console.log('标签默认数据创建成功');

            // 创建用户默认数据
            const users = await User.create([
                { username: 'user123', password: await bcrypt.hash('123456', 10), nickname: '旅行者1', email: 'user123@example.com', role: 'user' },
                { username: 'user12', password: await bcrypt.hash('123456', 10), nickname: '旅行者2', email: 'user12@example.com', role: 'user' },
                { username: 'user1234', password: await bcrypt.hash('123456', 10), nickname: '旅行者2', email: 'user1234@example.com', role: 'user' }
            ]);
            console.log('用户默认数据创建成功');

            // 创建游记默认数据
            const travelNotes = await TravelNote.create([
                { title: '我的第一次旅行', content: '这是我第一次旅行的经历...', author: users[0]._id, tags: [tags[0]._id], isPublic: true },
                { title: '美食之旅', content: '品尝当地美食的记录...', author: users[1]._id, tags: [tags[1]._id], isPublic: true },
                { title: '文化探索', content: '了解当地文化的经历...', author: users[2]._id, tags: [tags[2]._id], isPublic: true },
                { title: '历史记忆', content: '记录历史上的重要事件...', author: users[0]._id, tags: [tags[3]._id], isPublic: true },
                { title: '美食之旅', content: '品尝当地美食的记录...', author: users[0]._id, tags: [tags[1]._id], isPublic: true },
                { title: '文化探索', content: '了解当地文化的经历...', author: users[1]._id, tags: [tags[2]._id], isPublic: true },
                { title: '历史记忆', content: '记录历史上的重要事件...', author: users[2]._id, tags: [tags[3]._id], isPublic: true },
                { title: '美食之旅', content: '品尝当地美食的记录...', author: users[2]._id, tags: [tags[1]._id], isPublic: true },
                { title: '文化探索', content: '了解当地文化的经历...', author: users[0]._id, tags: [tags[2]._id], isPublic: true },
                { title: '历史记忆', content: '记录历史上的重要事件...', author: users[1]._id, tags: [tags[3]._id], isPublic: true },
                { title: '美食之旅', content: '品尝当地美食的记录...', author: users[1]._id, tags: [tags[1]._id], isPublic: true },
                { title: '文化探索', content: '了解当地文化的经历...', author: users[2]._id, tags: [tags[2]._id], isPublic: true },
                { title: '历史记忆', content: '记录历史上的重要事件...', author: users[0]._id, tags: [tags[3]._id], isPublic: true },
                { title: '美食之旅', content: '品尝当地美食的记录...', author: users[0]._id, tags: [tags[1]._id], isPublic: true },
                { title: '文化探索', content: '了解当地文化的经历...', author: users[1]._id, tags: [tags[2]._id], isPublic: true },
                { title: '历史记忆', content: '记录历史上的重要事件...', author: users[2]._id, tags: [tags[3]._id], isPublic: true }
            ]);
            console.log('游记默认数据创建成功');

            // 创建评论默认数据
            const comments = await Comment.create([
                { content: '写得真好！', authorId: users[1]._id, noteId: travelNotes[0]._id },
                { content: '看起来很不错！', authorId: users[2]._id, noteId: travelNotes[1]._id }
            ]);
            console.log('评论默认数据创建成功');

            // 创建收藏默认数据
            const favorites = await Favorite.create([
                { userId: users[1]._id, noteId: travelNotes[0]._id },
                { userId: users[2]._id, noteId: travelNotes[1]._id }
            ]);
            console.log('收藏默认数据创建成功');

            // 创建点赞默认数据
            const likes = await Like.create([
                { userId: users[1]._id, noteId: travelNotes[0]._id },
                { userId: users[2]._id, noteId: travelNotes[1]._id }
            ]);
            console.log('点赞默认数据创建成功');

            // 创建关注默认数据
            const follows = await Follow.create([
                { followerId: users[0]._id, followingId: users[1]._id },
                { followerId: users[0]._id, followingId: users[2]._id }
            ]);
            console.log('关注默认数据创建成功');
        } catch (error) {
            console.error('创建默认数据失败:', error);
        }

    } catch (error) {
        console.error('初始化账号失败:', error);
    }
}
// 连接数据库
mongoose.connect('mongodb://localhost:27017/travel_diary', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('MongoDB connected');
        await initializeDatabase();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/travel-notes', travelNoteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/images', imageRoutes);


// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器错误' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});