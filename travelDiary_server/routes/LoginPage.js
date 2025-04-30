const express = require('express');
const router = express.Router();

// 登录路由
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // 这里可以添加验证逻辑
    if (username === 'admin' && password === 'password') {
        req.session.user = { username };
        res.status(200).json({ message: '登录成功' });
    } else {
        res.status(401).json({ message: '用户名或密码错误' });
    }
});

module.exports = router;