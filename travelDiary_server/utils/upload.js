const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 确保上传目录存在
const createUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// 生成唯一文件名
const generateUniqueFilename = (originalname) => {
    // 生成32位随机字符串
    const randomString = crypto.randomBytes(16).toString('hex');
    // 获取原始文件扩展名
    const ext = path.extname(originalname);
    // 组合新文件名：时间戳-随机字符串.扩展名
    return `${Date.now()}-${randomString}${ext}`;
};

// 配置文件存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir = 'uploads/';
        console.log('file:',file);
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
        cb(null, generateUniqueFilename(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif','image/webp','image/jpg','image/webm'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    console.log('file:',file);

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