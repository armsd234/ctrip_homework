const express = require('express');
const router = express.Router();
const md5 = require("md5"); // 用于加密密码

const { User} = require("../models");

// 登录路由
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username, password: md5(password) });
      if (user) {
        
        res.status(200).json({
          status: "success",
          message: "Login successful",
          data: {
            token: token,
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