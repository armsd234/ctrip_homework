const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../model');
const { generateToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secure: false,
    auth: {
        user: '1812019788@qq.com', // 替换为您的邮箱
        pass: 'vrllvcfyfsbzfhcd'     // 替换为您的应用密码
    },

});

// 存储验证码的临时对象
const verificationCodes = new Map();

// 生成6位数字验证码
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 生成随机昵称（形容词+名词组合）
const generateRandomNickname = () => {
    const adjectives = ['快乐', '阳光', '可爱', '活力', '温暖', '自由', '宁静', '勇敢'];
    const nouns = ['旅行者', '日记家', '探索者', '记录者', '漫游者', '故事家', '观察者', '追光者'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}`;
};

// 生成唯一昵称
const generateUniqueNickname = async () => {
    let baseNickname = generateRandomNickname();
    let nickname = baseNickname;
    let suffix = 1;

    while (await User.findOne({ nickname })) {
        nickname = `${baseNickname}${suffix}`;
        suffix++;
    }

    return nickname;
};

// 发送验证码
router.post("/send-verification", async (req, res) => {
    const { email } = req.body;
    console.log(req.body);
    try {
        // 检查邮箱是否已被注册
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "该邮箱已被注册"
            });
        }

        const code = generateVerificationCode();
        verificationCodes.set(email, {
            code,
            timestamp: Date.now()
        });
        console.log('email:',email,'code:',code);
        // 发送邮件
        await transporter.sendMail({
            from: '1812019788@qq.com',
            to: email,
            subject: '验证您的邮箱',
            html: `
              <p>网站账户注册验证码：</p>
          <span style="font-size: 18px; color: red">` + code + `</span>
          <p>有效期为5分钟，请勿泄露给他人。</p>`

        });

        res.status(200).json({
            success: true,
            message: "验证码已发送"
        });
    } catch (err) {
        console.error("Error sending verification code:", err);
        res.status(500).json({
            success: false,
            message: "发送验证码失败，请重试"
        });
    }
});

// 验证验证码
router.post("/verify-code", async (req, res) => {
    const { password, email, code } = req.body;

    try {
        const storedData = verificationCodes.get(email);
        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "验证码已过期或不存在"
            });
        }

        // 检查验证码是否过期（5分钟）
        if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
            verificationCodes.delete(email);
            return res.status(400).json({
                success: false,
                message: "验证码已过期"
            });
        }

        if (storedData.code !== code) {
            return res.status(400).json({
                success: false,
                message: "验证码不正确"
            });
        }
        // 生成唯一昵称
        const uniqueNickname = await generateUniqueNickname();
        const newpass = await bcrypt.hash(password, 10);
        
        // 创建新用户
        const newUser = new User({
            username: uniqueNickname,
            password: newpass,
            email,
            nickname: uniqueNickname,
            avatar: 'default_avatar.jpg',
            backgroundImage: 'default_bg.jpg',
            signature: '这个人很懒，什么都没有留下。'
        });

        await newUser.save();
        // 验证成功后删除验证码
        verificationCodes.delete(email);

        res.status(200).json({
            success: true,
            message: "验证成功"
        });
    } catch (err) {
        console.error("Error verifying code:", err);
        res.status(500).json({
            success: false,
            message: "验证失败，请重试"
        });
    }
});

// 处理用户注册请求
router.post("/register", async (req, res) => {
    const { email } = req.body;

    try {
        // 检查邮箱是否已存在
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "邮箱已被注册"
            });
        }

        res.status(201).json({
            success: true,
            message: "成功"
        });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({
            success: false,
            message: "注册失败，请稍后重试"
        });
    }
});


// 用户登录
router.post('/login', async (req, res) => {
    try {
        console.log("req.body:", req.body);
        const { email, username, password } = req.body;
        let user;
        if (email) {
            // 查找用户
            user = await User.findOne({ email });
            //console.log("user:", user);
        } else if (username) {
            // 查找用户
            user = await User.findOne({ username });
        }
        //console.log("user:", user);
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }
        //console.log("user:", user);
        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成token
        const token = generateToken(user._id);

        // 将用户对象转换为普通对象并移除密码字段
        const userResponse = user.toObject();
        delete userResponse.password;
        

        res.json({"data": {
            token,
            user: userResponse
        }});
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});


// /auth/logout
router.post('/logout', auth, async (req, res) => {
    try {
        // 清除token
        res.clearCookie('token');
        res.json({ message: '退出成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
})

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            data: {
                user: user.toObject()
            }});
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 