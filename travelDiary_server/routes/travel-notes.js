const express = require('express');
const router = express.Router();
const { TravelNote, ReviewLog, User } = require('../model');
const { auth, isAdmin, isReviewer } = require('../middleware/auth');

// 获取游记列表(首页)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            status: status === 'all' ? { $in: ['pending', 'approved', 'rejected'] } : status
        };

        if (search) {
            // 先查找匹配昵称的用户
            const users = await User.find({
                nickname: { $regex: `.*${search}.*`, $options: 'i' }
            }).select('_id');

            // 构建查询条件
            query.$or = [
                { title: { $regex: `.*${search}.*`, $options: 'i' } },
                { content: { $regex: `.*${search}.*`, $options: 'i' } },
                { location: { $regex: `.*${search}.*`, $options: 'i' } }
            ];

            // 如果找到匹配的用户，添加作者ID条件
            if (users.length > 0) {
                query.$or.push({ author: { $in: users.map(user => user._id) } });
            }
        }

        const [notes, total] = await Promise.all([
            TravelNote.find(query)
                .populate('author', '_id nickname')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TravelNote.countDocuments(query)
        ]);
        // console.log("notes", notes);
        //为每个note 添加作者字段
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

// 审核员获取游记列表(首页)
router.get('/review/notes', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            status: status === 'all' ? { $in: ['pending', 'approved', 'rejected', 'deleted'] } : status,
        };
        if (search) {
            // 先查找匹配昵称的用户
            const users = await User.find({
                nickname: { $regex: `.*${search}.*`, $options: 'i' }
            }).select('_id');

            // 构建查询条件
            query.$or = [
                { title: { $regex: `.*${search}.*`, $options: 'i' } },
                { content: { $regex: `.*${search}.*`, $options: 'i' } },
                { location: { $regex: `.*${search}.*`, $options: 'i' } }
            ];

            // 如果找到匹配的用户，添加作者ID条件
            if (users.length > 0) {
                query.$or.push({ author: { $in: users.map(user => user._id) } });
            }
        }

        const [notes, total] = await Promise.all([
            TravelNote.find(query)
                .populate('author', '_id nickname')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TravelNote.countDocuments(query)
        ]);
        console.log("notes", notes);
        //为每个note 添加作者字段
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
// router.delete('/:id', auth, async (req, res) => {
//     try {
//         const note = await TravelNote.findById(req.params.id);

//         if (!note || note.isDeleted) {
//             return res.status(404).json({ message: '游记不存在' });
//         }

//         if (note.author.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: '无权删除此游记' });
//         }

//         await note.remove();
//         res.json({ message: '删除成功' });
//     } catch (error) {
//         res.status(500).json({ message: '服务器错误' });
//     }
// });

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

// 审核通过游记
router.post('/:id/approve', auth, isReviewer, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 更新游记状态为已通过
        note.status = 'approved';

        // 创建审核日志
        const reviewLog = new ReviewLog({
            noteId: note._id,
            reviewerId: req.user._id,
            action: 'approve',
            reason: '审核通过'
        });

        await Promise.all([
            note.save(),
            reviewLog.save()
        ]);

        res.json({
            message: '审核通过成功',
            note: {
                ...note.toObject(),
                status: 'approved'
            }
        });
    } catch (error) {
        console.error('审核通过失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 审核拒绝游记
router.post('/:id/reject', auth, isReviewer, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: '请提供拒绝原因' });
        }

        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 更新游记状态为已拒绝
        note.status = 'rejected';
        note.rejectionReason = reason;

        // 创建审核日志
        const reviewLog = new ReviewLog({
            noteId: note._id,
            reviewerId: req.user._id,
            action: 'reject',
            reason: reason
        });

        await Promise.all([
            note.save(),
            reviewLog.save()
        ]);

        res.json({
            message: '已拒绝该游记',
            note: {
                ...note.toObject(),
                status: 'rejected',
                rejectionReason: reason
            }
        });
    } catch (error) {
        console.error('审核拒绝失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除游记
router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 检查权限：只有作者和管理员可以删除
        // console.log('note.author', note.author);
        // console.log('req.user._id', req.user);
        // console.log('req.user.role', req.user.role);
        if (note.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权删除此游记' });
        }

        // 创建删除日志（如果是管理员删除）
        if (req.user.role === 'admin') {
            const reviewLog = new ReviewLog({
                noteId: note._id,
                reviewerId: req.user._id,
                action: 'delete',
                reason: '管理员删除'
            });
            await reviewLog.save();

        }
        // 逻辑删除
        note.isDeleted = true;
        note.status = 'deleted';
        await note.save();
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error('删除失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;