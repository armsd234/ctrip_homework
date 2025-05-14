const express = require('express');
const router = express.Router();
const { TravelNote, ReviewLog, User, Favorite, Like, Comment } = require('../model');
const { auth, isAdmin, isReviewer } = require('../middleware/auth');


// 获取游记列表(首页)特供
router.get('/newVersion', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            status: status === 'all' ? { $in: ['pending', 'approved', 'rejected'] } : status,
            video: { $in: ['', null] }  // 只获取 video 字段为空或 null 的记录
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
                .populate('author', '_id nickname avatar')
                .populate('tags', 'name image suggestion url') // 标签字段，引用Tag模型
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
        console.error(error); // 打印错误信息，方便调试
        res.status(500).json({ message: '服务器错误' });
    }
});


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
                .populate('author', '_id nickname avatar')
                .populate('tags', 'name image suggestion url') // 标签字段，引用Tag模型
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
        console.error(error); // 打印错误信息，方便调试
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
                .populate('author', '_id nickname avatar')
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
            images: images ? images : [''],
            video: video ? video : '',
            author: req.user._id,
            status: 'pending'
        });
        //更新作者post数
        const author = await User.findById(req.user._id);
        author.posts += 1;

        await Promise.all([
            note.save(),
            author.save()
        ]);

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});


// 获取所有游记详情,所有详情，每个游记的格式如单个游记详情
router.get('/node-all', async (req, res) => {
    try {
        const notes = await TravelNote.find({ isDeleted: false, status: 'approved', isPublic: true, video: { $ne: '' } })
            .populate('author')
            .populate('tags')
            .sort({ createdAt: -1 });

        // 获取总数用于分页
        const total = await TravelNote.countDocuments({ isDeleted: false });

        // 处理每个游记的数据
        const processedNotes = await Promise.all(notes.map(async (note) => {
            // 获取收藏数
            const favoritesCount = await Favorite.countDocuments({ noteId: note._id });

            // 获取评论数据
            const comments = await Comment.find({
                noteId: note._id,
                isDeleted: false
            }).populate('author');

            const commentsData = comments.map(comment => {
                // 检查评论作者是否存在
                const author = comment.author || {};
                return {
                    id: comment._id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    user: {
                        id: author._id || 'deleted',
                        nickname: author.nickname || '已删除用户',
                        avatar: author.avatar || 'default_avatar.jpg'
                    },
                    likes: comment.likesCount || 0,
                };
            }).filter(comment => comment !== null);

            // 检查游记作者是否存在
            const author = note.author || {};

            // 返回格式化的游记数据
            return {
                id: note._id,
                title: note.title || '',
                When: note.when || '',
                Days: note.days || '',
                Money: note.money || '',
                Who: note.who || '',
                tags: note.tags || [],
                content: note.content || '',
                coverImage: note.images || [],
                user: {
                    id: author._id || 'deleted',
                    nickname: author.nickname || '已删除用户',
                    avatar: author.avatar || 'default_avatar.jpg'
                },
                likes: note.likes || 0,
                collects: favoritesCount || 0,
                comments: note.commentCount || 0,
                views: note.views || 0,
                location: note.location || '',
                createTime: note.createdAt || new Date(),
                commentsData: commentsData || [],
                video: note.video || '',
                duration: '00:00:00'
            };
        }));

        // 返回响应
        res.json({
            data: processedNotes,
            total
        });

    } catch (error) {
        console.error('获取所有游记详情失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取单个游记详情
router.get('/:id', async (req, res) => {
    try {
        const { isValidObjectId } = require('mongoose');
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: '传入的 ID 不是有效的 ObjectId 格式' });
        }
        const note = await TravelNote.findById(req.params.id)
            .populate('author', 'nickname avatar')
            .populate('tags', 'name image suggestion url');
        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 增加浏览量
        note.views += 1;
        await note.save();

        const favoritesCount = await Favorite.countDocuments({ noteId: note._id });
        const comments = await Comment.find({ noteId: note._id, isDeleted: false }).populate('author', 'nickname avatar');
        const commentsData = comments.map(comment => {
            // 检查评论作者是否存在
            const author = comment.author || {};
            return {
                id: comment._id,
                content: comment.content,
                createdAt: comment.createdAt,
                user: {
                    id: author._id || 'deleted',
                    nickname: author.nickname || '已删除用户',
                    avatar: author.avatar || 'default_avatar.jpg'
                },
                likes: comment.likesCount || 0,
            };
        });

        const responseData = {
            data: [{
                id: note._id,
                title: note.title,
                When: note.when,
                Days: note.days,
                Money: note.money,
                Who: note.who,
                tags: note.tags,
                content: note.content,
                coverImage: note.images,
                user: {
                    id: note.author._id,
                    nickname: note.author.nickname,
                    avatar: note.author.avatar
                },
                likes: note.likesCount || 0,
                collects: note.favoriteCount || 0,
                comments: note.commentCount || 0,
                views: note.views || 0,
                location: note.location,
                createTime: note.createdAt,
                commentsData: commentsData,
                video: note.video,
                duration: '00:00:00'
            }]
        };

        res.json(responseData);
    } catch (error) {
        console.error('获取游记详情失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

//审核员获取单个游记详情
router.get('/admin/:id', async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id)
            .populate('author', 'nickname avatar')
            .populate('likes', 'nickname avatar');

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }
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


// 点赞游记
router.post('/:id/like', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 检查是否已经点赞
        const existingLike = await Like.findOne({
            userId: req.user._id,
            noteId: note._id
        });

        if (existingLike) {
            return res.status(400).json({ message: '已经点赞过了' });
        }

        // 创建点赞记录
        const like = new Like({
            userId: req.user._id,
            noteId: note._id
        });

        // 更新游记的点赞数
        note.likesCount += 1;

        // 更新作者的被赞数
        const author = await User.findById(note.author);
        author.likeds += 1;

        // 保存所有更改
        await Promise.all([
            like.save(),
            note.save(),
            author.save()
        ]);

        res.json({
            message: '点赞成功',
            likesCount: note.likesCount
        });
    } catch (error) {
        console.error('点赞失败:', error);
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

        // 查找并删除点赞记录
        const deletedLike = await Like.findOneAndDelete({
            userId: req.user._id,
            noteId: note._id
        });

        if (!deletedLike) {
            return res.status(400).json({ message: '还没有点赞过' });
        }

        // 更新游记的点赞数
        note.likesCount = Math.max(0, note.likesCount - 1);

        // 更新作者的被赞数
        const author = await User.findById(note.author);
        author.likeds = Math.max(0, author.likeds - 1);

        // 保存所有更改
        await Promise.all([
            note.save(),
            author.save()
        ]);

        res.json({
            message: '取消点赞成功',
            likesCount: note.likesCount
        });
    } catch (error) {
        console.error('取消点赞失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 收藏游记
router.post('/:id/favorite', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 检查是否已经收藏
        const existingFavorite = await Favorite.findOne({
            userId: req.user._id,
            noteId: note._id
        });

        if (existingFavorite) {
            return res.status(400).json({ message: '已经收藏过了' });
        }

        // 创建收藏记录
        const favorite = new Favorite({
            userId: req.user._id,
            noteId: note._id
        });

        // 更新游记的收藏数
        note.favoriteCount += 1;

        // 更新作者的被收藏数
        const author = await User.findById(note.author);
        author.favoriteds += 1;

        // 保存所有更改
        await Promise.all([
            favorite.save(),
            note.save(),
            author.save()
        ]);

        res.json({
            message: '收藏成功',
            favoriteCount: note.favoriteCount
        });
    } catch (error) {
        console.error('收藏失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 取消收藏
router.delete('/:id/favorite', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 查找并删除收藏记录
        const deletedFavorite = await Favorite.findOneAndDelete({
            userId: req.user._id,
            noteId: note._id
        });

        if (!deletedFavorite) {
            return res.status(400).json({ message: '还没有收藏过' });
        }

        // 更新游记的收藏数
        note.favoriteCount = Math.max(0, note.favoriteCount - 1);

        // 更新作者的被收藏数
        const author = await User.findById(note.author);
        author.favoriteds = Math.max(0, author.favoriteds - 1);

        // 保存所有更改
        await Promise.all([
            note.save(),
            author.save()
        ]);

        res.json({
            message: '取消收藏成功',
            favoriteCount: note.favoriteCount
        });
    } catch (error) {
        console.error('取消收藏失败:', error);
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


// 获取用户的游记列表
router.get('/user/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            author: req.params.userId,
            isDeleted: false,
            video: { $in: ['', null] }
            // status: { $in: ['pending', 'approved'] },
        };

        const [notes, total] = await Promise.all([
            TravelNote.find(query)
                .populate('author', 'nickname avatar')
                // tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // 标签字段，引用Tag模型
                .populate('tags', 'name image suggestion url') // 标签字段，引用Tag模型
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

// 获取用户收藏的游记列表
router.get('/favorites/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [favorites, total] = await Promise.all([
            Favorite.find({ userId: req.params.userId, video: { $in: ['', null] } })
                .populate({
                    path: 'noteId',
                    populate: {
                        path: 'author',
                        select: 'nickname avatar'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Favorite.countDocuments({ userId: req.params.userId })
        ]);

        const notes = favorites.map(fav => fav.noteId).filter(note => note && !note.isDeleted);

        res.json({
            data: notes,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        console.log('ghhj', notes);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取用户点赞的游记列表
router.get('/likes/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [likes, total] = await Promise.all([
            Like.find({ userId: req.params.userId, video: { $in: ['', null] } })
                .populate({
                    path: 'noteId',
                    populate: {
                        path: 'author',
                        select: 'nickname avatar'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Like.countDocuments({ userId: req.params.userId })
        ]);

        const notes = likes.map(like => like.noteId).filter(note => note && !note.isDeleted);

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

// 检查点赞状态
router.get('/:id/like/check', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 查找点赞记录
        const existingLike = await Like.findOne({
            userId: req.user._id,
            noteId: note._id
        });

        res.json({
            hasLiked: !!existingLike
        });
    } catch (error) {
        console.error('检查点赞状态失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 检查收藏状态
router.get('/:id/favorite/check', auth, async (req, res) => {
    try {
        const note = await TravelNote.findById(req.params.id);

        if (!note || note.isDeleted) {
            return res.status(404).json({ message: '游记不存在' });
        }

        // 查找收藏记录
        const existingFavorite = await Favorite.findOne({
            userId: req.user._id,
            noteId: note._id
        });

        res.json({
            hasFavorited: !!existingFavorite
        });
    } catch (error) {
        console.error('检查收藏状态失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;