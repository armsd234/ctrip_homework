const express = require('express');
const router = express.Router();
const path = require('path');
const { auth } = require('../middleware/auth');
const upload = require('../utils/upload');

// 上传单个图片
router.post('/image', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }

        // 返回文件访问路径
        const fileUrl = `/uploads/images/${req.file.filename}`;
        res.json({
            message: '图片上传成功',
            url: fileUrl
        });
    } catch (error) {
        res.status(500).json({ message: '图片上传失败' });
    }
});

// 上传多个图片
router.post('/images', auth, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }

        // 返回所有文件的访问路径
        const fileUrls = req.files.map(file => `/uploads/images/${file.filename}`);
        res.json({
            message: '图片上传成功',
            urls: fileUrls
        });
    } catch (error) {
        res.status(500).json({ message: '图片上传失败' });
    }
});

// 上传视频
router.post('/video', auth, upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的视频' });
        }

        // 返回文件访问路径
        const fileUrl = `/uploads/videos/${req.file.filename}`;
        res.json({
            message: '视频上传成功',
            url: fileUrl
        });
    } catch (error) {
        res.status(500).json({ message: '视频上传失败' });
    }
});

// 错误处理中间件
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '文件大小超出限制' });
        }
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: '文件上传失败' });
});

module.exports = router; 