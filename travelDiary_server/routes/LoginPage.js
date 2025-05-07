const express = require('express');
const router = express.Router();
const md5 = require("md5"); // 用于加密密码
const jwt = require('jsonwebtoken');

const { User } = require("../models");

const JWT_SECRET = 'your-secret-key'; 
const TOKEN_EXPIRATION = '24h'; // token 过期时间为24小时

// 登录路由
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
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
        status: "success",
        message: "Login successful",
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
      res.status(401).json({ status: "error", message: "用户名或密码不正确" });
      console.log("Invalid username or password");
    }
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).json({ status: "error", message: "出错了，请联系管理员" });
  }
});

// 验证 token 的中间件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "未提供认证token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "token无效或已过期" });
  }
};

// 获取当前用户信息的接口
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "用户不存在" });
    }

    res.status(200).json({
      status: "success",
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
    res.status(500).json({ status: "error", message: "出错了，请联系管理员" });
  }
});

// 处理用户注册请求
router.post("/register", async (req, res) => {
  const { username, password, email, phone } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "用户名已存在" });
    }
    const newUser = new User({ username, password: md5(password), email, phone }); // 加密密码
    await newUser.save();
    res.status(201).json({ status: "success", message: "注册成功" });

  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ status: "error", message: "出错了，请联系管理员" });
  }

});

module.exports = router;