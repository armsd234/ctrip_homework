const express = require('express');
const router = express.Router();
const { TravelNote, ReviewLog } = require('../model');
const { auth, isAdmin, isReviewer } = require('../middleware/auth');

// 获取待审核游记列表
router.get('/travel-notes', auth, isReviewer, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };
        if (status) {
            query.status = status;
        }

        const [notes, total] = await Promise.all([
            TravelNote.find(query)
                .populate('author', 'nickname avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TravelNote.countDocuments(query)
        ]);

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

// 审核通过游记
router.post('/travel-notes/:id/approve', auth, isReviewer, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        note.status = 'approved';
        await note.save();

        // 记录审核日志
        const log = new ReviewLog({
            noteId: note._id,
            reviewerId: req.user._id,
            action: 'approve'
        });
        await log.save();

        res.json({ message: '审核通过成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 审核拒绝游记
router.post('/travel-notes/:id/reject', auth, isReviewer, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: '请提供拒绝原因' });
        }

        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        note.status = 'rejected';
        note.rejectionReason = reason;
        await note.save();

        // 记录审核日志
        const log = new ReviewLog({
            noteId: note._id,
            reviewerId: req.user._id,
            action: 'reject',
            reason
        });
        await log.save();

        res.json({ message: '审核拒绝成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除游记(逻辑删除)
router.delete('/travel-notes/:id', auth, isAdmin, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        note.isDeleted = true;
        await note.save();

        // 记录审核日志
        const log = new ReviewLog({
            noteId: note._id,
            reviewerId: req.user._id,
            action: 'delete'
        });
        await log.save();

        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 