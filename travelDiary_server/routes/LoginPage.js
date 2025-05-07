const express = require('express');
const router = express.Router();
const md5 = require("md5"); // 用于加密密码
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { User } = require("../model.js");

const JWT_SECRET = 'your-secret-key';
const TOKEN_EXPIRATION = '24h'; // token 过期时间为24小时

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  secure: false,
  auth: {
    user: '1812019788@qq.com', // 替换为您的邮箱
    pass: 'vrllvcfyfsbzfhcd'     // 替换为您的应用密码
  },
  
});

// 存储验证码的临时对象（实际项目中应该使用 Redis）
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

    // 发送邮件
    await transporter.sendMail({
      from: '1812019788@qq.com',
      to: email,
      subject: '验证您的邮箱',
      html:  `
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
  const {password, email, code } = req.body;

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

    // 创建新用户
    const newUser = new User({
      password: md5(password),
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

// 登录路由
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // console.log(req.body)
  try {
    const user = await User.findOne({ username, password: md5(password) });
    if (user) {
      // 生成 JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      res.status(200).json({
        success: true,
        message: "登录成功",
        data: {
          token,
          userInfo: {
            userId: user._id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            backgroundImage: user.backgroundImage,
            signature: user.signature,
          },
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "用户名或密码不正确"
      });
    }
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).json({
      success: false,
      message: "服务器错误，请稍后重试"
    });
  }
});

// 验证 token 的中间件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "未提供认证token"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "token无效或已过期"
    });
  }
};

// 获取当前用户信息
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        backgroundImage: user.backgroundImage,
        signature: user.signature,
      },
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      success: false,
      message: "获取用户信息失败"
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

module.exports = router;