const express = require('express');
const router = express.Router();
const { TravelNote, ReviewLog } = require('../model');
const { auth, isAdmin, isReviewer } = require('../middleware/auth');

// 获取游记列表(首页)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', isPublic = true } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            
        };

        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { 'author.nickname': new RegExp(search, 'i') }
            ];
        }

        const [notes, total] = await Promise.all([
            TravelNote.find(query)
                .populate('author', 'nickname avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TravelNote.countDocuments(query)
        ]);
        // console.log("notes", notes);

        res.json({
            data: notes,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 创建游记
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, images, video } = req.body;
        const note = new TravelNote({
            title,
            content,
            images,
            video,
            author: req.user._id,
            status: 'pending'
        });

        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取单个游记详情
router.get('/:id', async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id)
            .populate('author', 'nickname avatar')
            .populate('likes', 'nickname avatar');

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 增加浏览量
        note.views += 1;
        await note.save();

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新游记
router.put('/:id', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        if (note.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权修改此游记' });
        }

        const { title, content, images, video } = req.body;
        Object.assign(note, {
            title,
            content,
            images,
            video,
            status: 'pending' // 重置为待审核状态
        });

        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除游记
router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        if (note.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权删除此游记' });
        }

        await note.remove();
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 点赞游记
router.post('/:id/like', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        if (note.likes.includes(req.user._id)) {
            return res.status(400).json({ message: '已经点赞过了' });
        }

        note.likes.push(req.user._id);
        await note.save();

        res.json({ likes: note.likes.length });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 取消点赞
router.delete('/:id/like', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        note.likes = note.likes.filter(
            like => like.toString() !== req.user._id.toString()
        );
        await note.save();

        res.json({ likes: note.likes.length });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;