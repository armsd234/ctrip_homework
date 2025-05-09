const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const createUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// 配置文件存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir = 'uploads/';

        // 根据文件类型选择不同的目录
        if (file.mimetype.startsWith('image/')) {
            uploadDir += 'images/';
        } else if (file.mimetype.startsWith('video/')) {
            uploadDir += 'videos/';
        }

        createUploadDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成文件名：时间戳 + 随机数 + 原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];

    if (file.mimetype.startsWith('image/') && allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else if (file.mimetype.startsWith('video/') && allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型'), false);
    }
};

// 创建上传中间件
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 限制文件大小为50MB
    }
});

module.exports = upload; 