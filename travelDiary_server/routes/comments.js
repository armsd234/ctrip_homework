const express = require('express');
const router = express.Router();
const { Comment, TravelNote } = require('../model');
const { auth } = require('../middleware/auth');

// 获取游记评论
router.get('/:noteId', async (req, res) => {
    try {
        const comments = await Comment.find({
            noteId: req.params.noteId,
            isDeleted: false
        })
            .populate('author', 'nickname avatar')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 添加评论
router.post('/:noteId', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const { noteId } = req.params;

        // 检查游记是否存在
        const note = await TravelNote.findOne({
            _id: noteId,
            isDeleted: false
        });

        if (!note) {
            return res.status(404).json({ message: '游记不存在' });
        }

        const comment = new Comment({
            content,
            author: req.user._id,
            noteId
        });

        await comment.save();

        // 填充作者信息
        await comment.populate('author', 'nickname avatar');

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除评论
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment || comment.isDeleted) {
            return res.status(404).json({ message: '评论不存在' });
        }

        // 检查是否为评论作者
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权删除此评论' });
        }

        comment.isDeleted = true;
        await comment.save();

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 