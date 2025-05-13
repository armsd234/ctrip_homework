const express = require('express');
const router = express.Router();
const { User,
    TravelNote,
    ReviewLog,
    Comment,
    Favorite,
    Tag,
    Like,
    Follow,
    Report } = require('../model');


//统计数据查询接口
//输入开始时间和结束时间，
// 返回对应区间的统计数据：如总用户数量、总游记数量、
// 总评论数量、总点赞数量、总收藏数量、总浏览量、总举报量
// 待审核笔记、待处理举报
// 区间内每日新用户、新笔记
// 热门笔记排行，点赞量前20的笔记。
// 输入：开始时间、结束时间
// 输出：统计数据
//接口：/api/mainindex/statistics?startDate=Mon,+05+May+2025+16:00:00+GMT&endDate=Tue,+13+May+2025+16:00:00+GMT
//返回：{totalUsers: 100, totalTravelNotes: 500, 
// totalComments: 2000, totalLikes: 10000, totalFavorites: 5000, totalViews: 20000, totalReports: 100,
// pendingReviews: 5, pendingReports: 2,
// newUserPerDay: [{date: "2025-05-05", count: 10}, {date: "2025-05-06", count: 20}],
// newTravelNotePerDay: [{date: "2025-05-05", count: 5}, {date: "2025-05-06", count: 10}],
// topTravelNotes: [{noteId: 1, title: "Example Note", likes: 1000}, {noteId: 2, title: "Another Note", likes: 500}]}
//}
router.get('/statistics', async (req, res) => {
    const { startTime, endTime } = req.query;
    const start = new Date(startTime);
    const end = new Date(endTime);

    try {
        const [
            totalUsers,
            totalTravelNotes,
            totalComments,
            totalLikes,
            totalFavorites,
            totalViews,
            totalReports,
            pendingReviews,
            pendingReports,
            newUserPerDay,
            newTravelNotePerDay,
            topTravelNotes
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            TravelNote.countDocuments({ createdAt: { $gte: start, $lte: end }, isDeleted: false }),
            Comment.countDocuments({ createdAt: { $gte: start, $lte: end }, isDeleted: false }),
            Like.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            Favorite.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            TravelNote.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end }, isDeleted: false } },
                { $group: { _id: null, total: { $sum: "$views" } } }
            ]),
            Report.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            TravelNote.countDocuments({ status: 'pending', isDeleted: false }),
            Report.countDocuments({ status: 'pending' }),
            User.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            TravelNote.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end }, isDeleted: false } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            TravelNote.find({ isDeleted: false }).sort({ likesCount: -1 }).limit(20).select('noteId title likesCount')
        ]);

        res.json({
            totalUsers,
            totalTravelNotes,
            totalComments,
            totalLikes,
            totalFavorites,
            totalViews: totalViews[0] ? totalViews[0].total : 0,
            totalReports,
            pendingReviews,
            pendingReports,
            newUserPerDay: newUserPerDay.map(item => ({ date: item._id, count: item.count })),
            newTravelNotePerDay: newTravelNotePerDay.map(item => ({ date: item._id, count: item.count })),
            topTravelNotes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});


module.exports = router;