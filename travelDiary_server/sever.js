const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');


const loginRoutes = require("./routes/LoginPage");

const connectDB = require('./utils/db');

const app = express();
// 定义端口
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60, // 1 hours
            secure: false, // 仅在 HTTPS 下传输
            httpOnly: true, // 防止客户端 JavaScript 访问 cookie
            sameSite: "lax" // 防止 CSRF 攻击
        }
    })
);

// 路由
app.use("/auth", loginRoutes);

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.error('Failed to start server due to database connection error:', err);
});