# 才藝老師管理系統 (Talent Teacher Management System)

才藝老師管理系統是一個全面的解決方案，用於管理才藝教育機構的老師、課程、排課和學生信息。

## 功能特點 (Features)

- 老師管理：追蹤老師信息、專長和可用時間
- 課程管理：創建和管理各種課程
- 排課系統：智能排課，避免時間衝突
- 學生管理：管理學生信息和課程註冊
- 位置追蹤：追蹤老師位置，優化教學安排
- 通知系統：自動發送提醒和通知
- 報表生成：生成各種統計報表
- LINE整合：與LINE平台無縫集成

## 技術棧 (Tech Stack)

### 前端 (Frontend)
- Vue.js 3
- SCSS
- Webpack

### 後端 (Backend)
- Node.js
- Express
- Sequelize ORM
- MySQL

### 其他 (Others)
- JWT認證
- RESTful API
- 響應式設計

## 安裝與運行 (Installation & Running)

### 前端 (Frontend)
```bash
cd web
npm install
npm run dev
```

### 後端 (Backend)
```bash
cd server
npm install
npm run dev
```

## 項目結構 (Project Structure)

```
/
├── web/                # 前端項目
│   ├── public/         # 靜態資源
│   ├── src/            # 源代碼
│   │   ├── components/ # 組件
│   │   ├── views/      # 頁面
│   │   ├── router/     # 路由
│   │   ├── styles/     # 樣式
│   │   ├── utils/      # 工具函數
│   │   ├── App.vue     # 主應用組件
│   │   └── main.js     # 入口文件
│   └── package.json    # 依賴配置
│
├── server/             # 後端項目
│   ├── config/         # 配置文件
│   ├── src/            # 源代碼
│   │   ├── controllers/# 控制器
│   │   ├── middleware/ # 中間件
│   │   ├── models/     # 數據模型
│   │   ├── routes/     # 路由
│   │   ├── utils/      # 工具函數
│   │   └── app.js      # 應用入口
│   └── package.json    # 依賴配置
│
└── devlog/             # 開發日誌
```

## 開發規範 (Development Guidelines)

請參考 `devlog/project-guidelines.md` 文件了解項目開發規範。

## 開發日誌 (Development Log)

開發進度和日誌記錄在 `devlog/` 目錄下。

## 貢獻 (Contributing)

歡迎提交問題和改進建議。

## 許可證 (License)

本項目採用 [MIT 許可證](LICENSE)。 