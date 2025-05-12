const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const { User } = require('../model');
const upload = require('../utils/upload');

// 上传头像
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的头像' });
        }

        // 只返回文件名
        res.json({
            message: '头像上传成功',
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: '头像上传失败' });
    }
});

// 上传背景图片
router.post('/background', auth, upload.single('background'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的背景图片' });
        }

        // 只返回文件名
        res.json({
            message: '背景图片上传成功',
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: '背景图片上传失败' });
    }
});

// 获取用户头像
router.get('/avatar/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('avatar');
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json({ url: user.avatar });
    } catch (error) {
        res.status(500).json({ message: '获取头像失败' });
    }
});

// 获取用户背景图片
router.get('/background/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('backgroundImage');
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json({ url: user.backgroundImage });
    } catch (error) {
        res.status(500).json({ message: '获取背景图片失败' });
    }
});

// 上传多个图片
router.post('/images', auth, upload.array('images', 9), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }
        // 只返回文件名
        res.json({
            message: '图片上传成功',
            filenames: req.files.map(file => file.filename)
        });
    } catch (error) {
        res.status(500).json({ message: '图片上传失败' });
    }
});

// 上传单个图片
router.post('/image', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }
        // 只返回文件名
        res.json({
            message: '图片上传成功',
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: '图片上传失败' });
    }
});

router.get('/image', (req, res) => {
    try {
        const { filename } = req.query;
        if (!filename) {
            return res.status(400).json({ message: '请提供文件名' });
        }

        // 使用 path.resolve 获取绝对路径
        const filePath = path.resolve(__dirname, '../uploads/images', filename);
        // console.log('请求的文件路径:', filePath);

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.log('文件不存在');
            return res.status(404).json({ message: '图片不存在' });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('获取图片错误:', error);
        res.status(500).json({ message: '获取图片失败' });
    }
});

// 上传视频
router.post('/video', auth, upload.single('video'), (req, res) => {
    try {
        console.log('请求的文件:', req.file);
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的视频' });
        }
        // 只返回文件名
        res.json({
            message: '视频上传成功',
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: '视频上传失败' });
    }
});

// 获取视频
router.get('/video', (req, res) => {
    try {
        const { filename } = req.query;
        console.log('请求的文件名:', req.query); // 打印文件名以进行调试
        const decodedFilename = decodeURIComponent(filename);
        const filePath = path.join(__dirname, '../uploads/videos', decodedFilename);
        console.log('请求的文件路径:', filePath); // 打印文件路径以进行调试
        console.log('文件是否存在:', fs.existsSync(filePath)); // 打印文件是否存在以进行调试
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: '视频不存在' });
        }

        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({ message: '获取视频失败' });
    }
});

const multer = require('multer');
const { log } = require('console');
// 错误处理中间件
router.use((error, req, res, next) => {
    console.log('其他错误:', error);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '文件大小超出限制' });
        }
        return res.status(400).json({ message: error.message });
    }
    console.log('其他错误:', error);
    res.status(500).json({ message: '文件上传失败' });
});

module.exports = router;