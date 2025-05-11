const { verifyToken } = require('../utils/jwt');
const { User } = require('../model');

// 验证用户是否已登录
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        //console.log(token) // 打印token 看是否有token 有就继续 没有就返回n
        if (!token) {
            return res.status(401).json({ message: '未提供认证token' });
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: '认证失败' });
    }
};

// 验证是否为管理员
const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};

// 验证是否为审核人员或管理员
const isReviewer = async (req, res, next) => {
    if (!['admin', 'reviewer'].includes(req.user.role)) {
        return res.status(403).json({ message: '需要审核权限' });
    }
    next();
};

module.exports = {
    auth,
    isAdmin,
    isReviewer
}; 