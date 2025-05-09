const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bcrypt = require('bcryptjs');
const { User } = require('./model');
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
async function initializeAccounts() {
    try {
        // 删除所有现有的管理员和审核人员账号
        await User.deleteMany({ role: { $in: ['admin', 'reviewer'] } });
        console.log('已删除所有现有的管理员和审核人员账号');

        await User.deleteMany({ username: 'user@example.com' });
        console.log('已删除默认的普通用户账号');

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
        const userHashedPassword = await bcrypt.hash(config.user.password, 10);
        await User.create({
            ...config.user,
            password: userHashedPassword
        });
        console.log('普通用户账号创建成功');

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
        await initializeAccounts();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 