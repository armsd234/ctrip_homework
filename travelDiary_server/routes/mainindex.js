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
// 待审核笔记数、待处理举报数
// 区间内每日新用户数、新笔记数
// 热门笔记排行，即点赞量前10的笔记。
//如果没有传入开始时间和结束时间，则newUserPerDay，newUserPerDay，top10TravelNotes默认查询最近7天的数据，其他字段默认查询所有时间范围查询。
// 输入：开始时间、结束时间
// 输出：统计数据
//接口：/api/mainindex/statistics?startDate=Mon,+05+May+2025+16:00:00+GMT&endDate=Tue,+13+May+2025+16:00:00+GMT
//返回：{totalUsers: 100, totalTravelNotes: 500, 
// totalComments: 2000, totalLikes: 10000, totalFavorites: 5000, totalViews: 20000, totalReports: 100,
// pendingReviews: 5, pendingReports: 2,
// newUserPerDay: [{date: "2025-05-05", count: 10}, {date: "2025-05-06", count: 20}],
// newTravelNotePerDay: [{date: "2025-05-05", count: 5}, {date: "2025-05-06", count: 10}],
// top10TravelNotes: [{noteId: 1, title: "Example Note", likes: 1000}, {noteId: 2, title: "Another Note", likes: 500}]}
//}
router.get('/statistics', async (req, res) => {
    const { startTime, endTime } = req.query;
    let start, end;

    // 如果没有传入时间，默认查询最近7天
    if (!startTime || !endTime) {
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 7);
    } else {
        start = new Date(startTime);
        end = new Date(endTime);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: '传入的日期参数无效，请检查。' });
    }

    try {
        // 查询所有时间范围的统计数据
        const [
            totalUsers,
            totalTravelNotes,
            totalComments,
            totalLikes,
            totalFavorites,
            totalViewsResult,
            totalReports,
            pendingReviews,
            pendingReports
        ] = await Promise.all([
            // 总用户数量 - 所有时间
            User.countDocuments(),
            // 总游记数量 - 所有时间
            TravelNote.countDocuments({ isDeleted: false }),
            // 总评论数量 - 所有时间
            Comment.countDocuments({ isDeleted: false }),
            // 总点赞数量 - 所有时间
            Like.countDocuments(),
            // 总收藏数量 - 所有时间
            Favorite.countDocuments(),
            // 总浏览量 - 所有时间
            TravelNote.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: null, total: { $sum: "$views" } } }
            ]).exec(),
            // 总举报量 - 所有时间
            Report.countDocuments(),
            // 待审核笔记数 - 当前状态
            TravelNote.countDocuments({ status: 'pending', isDeleted: false }),
            // 待处理举报数 - 当前状态
            Report.countDocuments({ status: 'pending' })
        ]);

        // 查询指定时间范围的每日数据（默认最近7天）
        const [newUsersPerDay, newTravelNotesPerDay, top10TravelNotes] = await Promise.all([
            // 每日新用户数
            User.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]).exec(),
            // 每日新游记数
            TravelNote.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start, $lte: end },
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]).exec(),
            // 热门游记排行（点赞量前10）
            TravelNote.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start, $lte: end },
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authorInfo'
                    }
                },
                { $unwind: '$authorInfo' },
                {
                    $project: {
                        title: 1,
                        likes: 1,
                        views: 1,
                        createdAt: 1,
                        'author.nickname': '$authorInfo.nickname',
                        'author.avatar': '$authorInfo.avatar'
                    }
                },
                { $sort: { likes: -1, views: -1 } },
                { $limit: 10 }
            ]).exec()
        ]);

        // 填充可能缺失的日期数据
        const fillMissingDates = (data, start, end) => {
            const dates = {};
            const current = new Date(start);
            while (current <= end) {
                dates[current.toISOString().split('T')[0]] = 0;
                current.setDate(current.getDate() + 1);
            }

            data.forEach(item => {
                dates[item._id] = item.count;
            });

            return Object.entries(dates).map(([date, count]) => ({
                date,
                count
            }));
        };

        res.json({
            code: 200,
            data: {
                // 总计数据
                totalUsers,
                totalTravelNotes,
                totalComments,
                totalLikes,
                totalFavorites,
                totalViews: totalViewsResult[0]?.total || 0,
                totalReports,
                // 待处理数据
                pendingReviews,
                pendingReports,
                // 每日统计数据
                newUserPerDay: fillMissingDates(newUsersPerDay, start, end),
                newTravelNotePerDay: fillMissingDates(newTravelNotesPerDay, start, end),
                // 热门游记
                top10TravelNotes
            },
            message: 'success'
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            code: 500,
            message: '获取统计数据失败',
            error: error.message
        });
    }
});


module.exports = router;