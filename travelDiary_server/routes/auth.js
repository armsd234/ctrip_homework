const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../model');
const { generateToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, password, nickname, avatar } = req.body;

        // 检查用户名和昵称是否已存在
        const existingUser = await User.findOne({
            $or: [{ username }, { nickname }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: '用户名或昵称已存在'
            });
        }

        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 创建新用户
        const user = new User({
            username,
            password: hashedPassword,
            nickname,
            avatar: avatar || 'default_avatar.jpg'
        });

        await user.save();

        res.status(201).json({
            message: '注册成功',
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成token
        const token = generateToken(user._id);

        res.json({
            token,
            userInfo: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 