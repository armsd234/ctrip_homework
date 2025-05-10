const express = require('express');
const router = express.Router();
const { TravelNote, Favorite } = require('../model');
const { auth } = require('../middleware/auth');

// 获取用户自己的游记列表
router.get('/me/travel-notes', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const query = { author: req.user._id, isDeleted: false };

        if (status) {
            query.status = status;
        }

        const notes = await TravelNote.find(query)
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新用户信息
router.put('/me', auth, async (req, res) => {
    try {
        const { nickname, avatar, signature, gender, birthday, location } = req.body;
        const updates = {};

        if (nickname) {
            // 检查昵称是否已被使用
            const existingUser = await User.findOne({
                nickname,
                _id: { $ne: req.user._id }
            });

            if (existingUser) {
                return res.status(400).json({ message: '昵称已被使用' });
            }
            updates.nickname = nickname;
        }

        if (avatar) {
            updates.avatar = avatar;
        }

        if (signature !== undefined) {
            updates.signature = signature;
        }

        if (gender) {
            updates.gender = gender;
        }

        if (birthday) {
            updates.birthday = birthday;
        }

        if (location) {
            updates.location = location;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取用户收藏的游记
router.get('/me/favorites', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user._id })
            .populate({
                path: 'noteId',
                populate: {
                    path: 'author',
                    select: 'nickname avatar'
                }
            })
            .sort({ createdAt: -1 });

        res.json(favorites.map(fav => fav.noteId));
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 收藏游记
router.post('/me/favorites/:noteId', auth, async (req, res) => {
    try {
        const { noteId } = req.params;

        // 检查游记是否存在
        const note = await TravelNote.findOne({
            _id: noteId,
            isDeleted: false
        });

        if (!note) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 检查是否已收藏
        const existingFavorite = await Favorite.findOne({
            userId: req.user._id,
            noteId
        });

        if (existingFavorite) {
            return res.status(400).json({ message: '已经收藏过了' });
        }

        const favorite = new Favorite({
            userId: req.user._id,
            noteId
        });

        await favorite.save();
        res.status(201).json({ message: '收藏成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 取消收藏
router.delete('/me/favorites/:noteId', auth, async (req, res) => {
    try {
        const { noteId } = req.params;

        const result = await Favorite.deleteOne({
            userId: req.user._id,
            noteId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '未找到收藏记录' });
        }

        res.json({ message: '取消收藏成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 