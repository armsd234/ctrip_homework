# 内容审核（PC 端）

## 1. 项目概述

这是一个基于 React 的旅行日记管理系统的前端项目，主要用于管理和用户发布的游记。

## 2. 项目结构

```
src/
├── assets/        # 静态资源文件
├── components/    # 可复用组件
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── services/      # API 服务
├── store/         # Redux 状态管理
├── utils/         # 工具函数
├── App.js         # 应用主入口
└── index.js       # 项目入口文件
```

## 3. 核心功能

### 3.1 用户认证系统

#### 功能描述

- 登录/登出功能
- 基于 Token 的身份验证
- 权限控制

#### 技术实现

- 使用 React Router v6 实现路由管理
- 基于 HOC 模式实现 `PrivateRoute` 组件进行路由保护
- 集成 JWT Token 验证机制
- 使用 Redux Toolkit 管理用户认证状态
- 实现路由守卫功能，自动跳转未授权访问

### 3.2 监控面板功能

#### 功能描述

- 数据统计和可视化
- 图表展示

#### 技术实现

- 使用 Ant Design 组件库构建界面
- 使用 ECharts 实现数据可视化
- Axios 处理 API 请求

### 3.3 主页功能

#### 功能描述

- 游记预览展示
- 游记审核操作
- 游记状态筛选
- 游记详情展示

#### 技术实现

- 使用 React 组件化开发
- Redux Toolkit 进行状态管理
- Ant Design 组件库实现界面交互
- Axios 处理后端 API 调用

## 4. 快速开始

### 4.1 安装依赖

```bash
npm install
```

### 4.2 启动开发服务器

```bash
npm start
```
