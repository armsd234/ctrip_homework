# ctrip_homework
携程大作业：旅游日记

# 迹忆（MemoTrails）-- 旅游日记平台

## 项目介绍

”迹忆（MemoTrails）“是一款能够记录和分享旅行见闻的APP，用户登录后能够在上面浏览来自世界各地的旅游记录和攻略分享，从游记列表的瀑布流卡片中可以点击到游记详情页。用户可以在应用上发布自己的游记，上传旅行的照片，编辑游记内容，还能实时获取自己的定位地点。浏览游记的同时可以同别人社交，点赞收藏自己喜欢的游记，并进行分享。还可管理自己的主页，设置头像等信息，我的主页可以展示自己创建的笔记，记录点赞和收藏过的笔记。出于网络安全考虑，用户在上传内容之前需先经过审核，因此需要设计一个审核管理系统，来对用户发布的待审核游记进行审核，通过了才可展示在首页，不通过要写明理由，便于用户修改。给审核管理系统额外设计一个权限系统，便于进行管理，分权限进行页面展示，设置操作动作。我们的”迹忆“不仅在功能上实现了用户需求，更在界面美观、交互流畅等方面进行了精心设计，充分考虑了人机交互的各个环节，配色和谐，布局合理，用户能够很好上手。下面展开介绍一下我们的”蓝鸟漫游日志“。



## 环境配置

- ### 用户系统（移动端）

技术栈：React Native、Nodejs

#### 移动端环境配置 

```
cd TravelDiary\TravelDiaryProject
npx expo install
npx expo start
```

- ### 审核管理系统（PC 站点）

技术栈：React、Nodejs

开源 UI 组件库：Ant Design

#### 环境配置 

```
cd Diary_manage\diary-manage
npm install
npm start
```

- ### 后端环境配置 backend
技术栈：Nodejs, mongodb
#### 环境配置
安装mongodb，启动mongodb服务
```
cd travelDiary_server
npm install 
nodemon server.js
```

