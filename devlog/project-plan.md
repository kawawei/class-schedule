# 才藝老師管理系統 - 核心後台開發規劃

*文檔創建日期: 2023-05-25*  
*最後更新日期: 2023-05-25*

## 1. 系統架構設計

### 前端架構
- **框架**: Vue 3 + Composition API
  - 採用最新的Vue 3框架，利用Composition API提高代碼復用性和可維護性
- **狀態管理**: Pinia (Vue 3推薦的狀態管理工具)
  - 相比Vuex更輕量、更符合Vue 3的設計理念
- **路由**: Vue Router
  - 處理前端路由，實現SPA應用
- **UI框架**: 自定義組件系統 + Tailwind CSS (用於基礎樣式)
  - 開發自己的組件庫，確保現代化風格和一致性
  - 使用Tailwind CSS提供基礎樣式支持，加速開發
- **HTTP客戶端**: Axios
  - 處理API請求，支持攔截器和全局配置
- **構建工具**: Vite (比Webpack更快的構建工具)
  - 提供更快的開發體驗和構建速度

### 後端架構
- **框架**: Node.js + Express.js
  - 輕量級、高效的後端框架
- **資料庫**: MongoDB (適合快速迭代和靈活的數據結構)
  - 使用Mongoose ODM進行數據建模和操作
- **API設計**: RESTful API + JWT認證
  - 遵循RESTful設計原則
  - 使用JWT進行無狀態認證
- **即時通訊**: Socket.io (用於實時通知和位置追蹤)
  - 實現實時數據更新和通知
- **LINE整合**: LINE Messaging API + LIFF
  - 與LINE平台整合，實現老師端功能

### 部署架構
- **前端**: Netlify/Vercel (靜態資源託管)
  - 提供CDN加速和自動部署
- **後端**: Docker + AWS/GCP (容器化部署)
  - 容器化確保環境一致性
  - 雲服務提供高可用性和擴展性
- **CI/CD**: GitHub Actions (自動化部署流程)
  - 自動化測試和部署流程

## 2. 資料庫設計

### 主要集合(Collections)
1. **Brands** (品牌)
   - brandId: String (唯一標識)
   - name: String (品牌名稱)
   - logo: String (品牌logo URL)
   - description: String (品牌描述)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

2. **Teachers** (老師)
   - teacherId: String (唯一標識)
   - name: String (老師姓名)
   - phone: String (聯絡電話)
   - email: String (電子郵件)
   - specialties: Array (專長領域)
   - availableTimeSlots: Array (可用時段)
   - brands: Array (關聯品牌ID)
   - lineId: String (LINE ID)
   - status: String (狀態: 活躍/非活躍)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

3. **Courses** (課程)
   - courseId: String (唯一標識)
   - name: String (課程名稱)
   - description: String (課程描述)
   - duration: Number (課程時長，分鐘)
   - materials: Array (所需教材ID)
   - brandId: String (所屬品牌)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

4. **Materials** (教材)
   - materialId: String (唯一標識)
   - name: String (教材名稱)
   - description: String (教材描述)
   - stock: Number (庫存數量)
   - price: Number (單價)
   - courseId: String (關聯課程)
   - brandId: String (所屬品牌)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

5. **Schedules** (排課)
   - scheduleId: String (唯一標識)
   - teacherId: String (老師ID)
   - courseId: String (課程ID)
   - clientId: String (客戶ID)
   - location: Object (上課地點，包含地址和坐標)
   - startTime: Date (開始時間)
   - endTime: Date (結束時間)
   - status: String (狀態: 待確認/已確認/已完成/已取消)
   - materialUsage: Array (教材使用記錄)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

6. **Clients** (客戶)
   - clientId: String (唯一標識)
   - name: String (客戶名稱)
   - address: String (地址)
   - phone: String (聯絡電話)
   - email: String (電子郵件)
   - notes: String (備註)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

7. **TeacherReports** (老師回報)
   - reportId: String (唯一標識)
   - scheduleId: String (排課ID)
   - teacherId: String (老師ID)
   - departureTime: Date (出發時間)
   - arrivalTime: Date (抵達時間)
   - locationData: Array (位置數據，包含時間戳和坐標)
   - materialUsed: Array (使用的教材)
   - notes: String (備註)
   - createdAt: Date (創建時間)

8. **Payments** (薪資計算)
   - paymentId: String (唯一標識)
   - teacherId: String (老師ID)
   - period: Object (計算週期，開始和結束日期)
   - hourlyRate: Number (鐘點費率)
   - totalHours: Number (總時數)
   - materialFee: Number (教材費)
   - totalAmount: Number (總金額)
   - status: String (狀態: 待確認/已確認/已支付)
   - createdAt: Date (創建時間)
   - updatedAt: Date (更新時間)

## 3. 前端組件系統設計

### 基礎組件 (Base Components)
- **TButton**: 按鈕組件，支持不同尺寸、顏色和狀態
  - 屬性: size, color, variant, disabled, loading
  - 事件: click, focus, blur

- **TInput**: 輸入框組件，支持各種輸入類型和驗證
  - 屬性: type, value, placeholder, disabled, error, success
  - 事件: input, change, focus, blur

- **TSelect**: 下拉選擇組件
  - 屬性: options, value, placeholder, multiple, disabled
  - 事件: change, focus, blur

- **TCheckbox/TRadio**: 複選/單選組件
  - 屬性: checked, disabled, label
  - 事件: change

- **TTable**: 表格組件，支持排序、篩選和分頁
  - 屬性: columns, data, sortable, filterable, pagination
  - 事件: sort, filter, page-change

- **TModal**: 模態框組件
  - 屬性: visible, title, width, closable
  - 事件: open, close, confirm

- **TCard**: 卡片容器組件
  - 屬性: title, bordered, shadow
  - 插槽: header, body, footer

- **TAlert**: 提示組件
  - 屬性: type, message, closable
  - 事件: close

- **TBadge**: 徽章組件
  - 屬性: value, max, type, dot
  - 插槽: default

- **TAvatar**: 頭像組件
  - 屬性: src, size, shape, alt
  - 事件: error

- **TDatePicker**: 日期選擇器
  - 屬性: value, format, range, disabled
  - 事件: change

- **TTimePicker**: 時間選擇器
  - 屬性: value, format, disabled
  - 事件: change

### 業務組件 (Business Components)
- **TeacherCard**: 老師信息卡片
  - 顯示老師基本信息、專長和狀態
  - 提供快速操作按鈕

- **ScheduleCalendar**: 排課日曆視圖
  - 支持日/週/月視圖切換
  - 顯示課程時段和衝突

- **MaterialCounter**: 教材計數器
  - 教材數量增減控制
  - 顯示庫存狀態

- **LocationTracker**: 位置追蹤地圖
  - 整合地圖API
  - 顯示老師位置和路徑

- **NotificationCenter**: 通知中心
  - 顯示系統通知
  - 支持標記已讀和篩選

- **PaymentCalculator**: 薪資計算器
  - 根據時數和費率計算薪資
  - 生成薪資明細

- **StatusBadge**: 狀態徽章
  - 顯示不同狀態的視覺標識
  - 支持自定義顏色和圖標

- **ReportForm**: 老師回報表單
  - 整合位置、時間和教材使用報告
  - 支持照片上傳

- **BrandSelector**: 品牌選擇器
  - 切換不同品牌視圖
  - 顯示品牌標識

### 頁面布局組件 (Layout Components)
- **AppHeader**: 應用頭部
  - 包含品牌切換、用戶信息和通知
  - 響應式設計

- **AppSidebar**: 側邊導航
  - 主要導航菜單
  - 可折疊設計

- **AppFooter**: 應用底部
  - 版權信息和快速鏈接
  - 響應式設計

- **DashboardLayout**: 儀表板布局
  - 組合Header、Sidebar和Footer
  - 主內容區域

- **PageContainer**: 頁面容器
  - 統一頁面間距和背景
  - 頁面標題和麵包屑

## 4. 頁面結構設計

### 主要頁面
1. **登入/認證**
   - 登入頁面: 用戶名密碼登入
   - 忘記密碼: 密碼重置流程
   - 個人資料設置: 修改個人信息和密碼

2. **儀表板**
   - 概覽統計: 關鍵數據卡片和圖表
   - 今日課程: 當日排課列表
   - 待處理通知: 需要關注的系統通知
   - 快速操作: 常用功能快捷入口

3. **老師管理**
   - 老師列表: 所有老師的表格視圖
   - 老師詳情: 老師個人資料和歷史記錄
   - 新增/編輯老師: 老師信息表單
   - 老師排課日曆: 特定老師的排課視圖

4. **課程管理**
   - 課程列表: 所有課程的表格視圖
   - 課程詳情: 課程信息和相關教材
   - 新增/編輯課程: 課程信息表單

5. **排課系統**
   - 排課日曆視圖: 可視化排課界面
   - 排課列表視圖: 表格形式的排課記錄
   - 新增/編輯排課: 排課表單
   - 衝突檢測: 時間和老師衝突提示

6. **教材管理**
   - 教材列表: 所有教材的表格視圖
   - 教材使用記錄: 教材使用歷史
   - 庫存管理: 庫存變動和預警
   - 教材簽收記錄: 主任簽收的記錄

7. **客戶管理**
   - 客戶列表: 所有客戶的表格視圖
   - 客戶詳情: 客戶信息和課程記錄
   - 客戶課程記錄: 特定客戶的課程歷史

8. **位置追蹤**
   - 實時地圖: 顯示老師當前位置
   - 歷史路徑: 查看歷史移動路徑
   - 異常提醒: 位置異常或延遲提醒

9. **通知系統**
   - 通知設置: 配置通知規則
   - 通知記錄: 歷史通知列表
   - 手動發送通知: 向老師發送自定義通知

10. **薪資管理**
    - 薪資計算: 自動計算薪資界面
    - 薪資報表: 生成薪資報表
    - 薪資歷史: 歷史薪資記錄

11. **系統設置**
    - 品牌管理: 品牌CRUD操作
    - 用戶權限: 角色和權限設置
    - 系統參數: 全局參數配置

## 5. 開發階段規劃

### 第一階段：基礎架構與核心功能 (4週)
1. **週1**: 項目初始化與基礎組件開發
   - 建立項目結構
   - 開發基礎UI組件
   - 設計整體風格指南

2. **週2**: 認證系統與用戶管理
   - 登入/登出功能
   - 權限控制
   - 用戶管理介面

3. **週3**: 老師與課程管理
   - 老師CRUD操作
   - 課程CRUD操作
   - 品牌管理

4. **週4**: 排課系統基礎功能
   - 日曆視圖
   - 排課CRUD操作
   - 衝突檢測邏輯

### 第二階段：核心業務功能 (4週)
5. **週5**: 教材管理系統
   - 教材CRUD操作
   - 庫存管理
   - 教材簽收流程

6. **週6**: 客戶管理與報表
   - 客戶CRUD操作
   - 客戶課程記錄
   - 基礎報表功能

7. **週7**: 位置追蹤系統
   - 地圖整合
   - 位置記錄
   - 異常檢測

8. **週8**: 通知系統
   - 系統內通知
   - LINE Bot基礎整合
   - 提醒設置

### 第三階段：進階功能與優化 (4週)
9. **週9**: 薪資計算系統
   - 鐘點費計算
   - 教材費計算
   - 薪資報表生成

10. **週10**: LINE完整整合
    - LIFF頁面開發
    - 老師回報流程
    - 位置分享功能

11. **週11**: 系統優化與性能提升
    - 前端性能優化
    - API響應優化
    - 資料庫查詢優化

12. **週12**: 測試與部署準備
    - 單元測試
    - 集成測試
    - 部署腳本準備

### 第四階段：部署與上線 (2週)
13. **週13**: 系統部署
    - 前端部署
    - 後端部署
    - 數據庫遷移

14. **週14**: 系統測試與上線
    - 用戶測試
    - 問題修復
    - 正式上線

## 6. 技術細節與最佳實踐

### 前端代碼組織
```
src/
├── assets/            # 靜態資源
├── components/        # 組件
│   ├── base/          # 基礎組件
│   ├── business/      # 業務組件
│   └── layout/        # 布局組件
├── composables/       # 可複用的組合式函數
├── router/            # 路由配置
├── stores/            # Pinia狀態管理
├── styles/            # 全局樣式
├── utils/             # 工具函數
├── views/             # 頁面視圖
│   ├── auth/
│   ├── dashboard/
│   ├── teachers/
│   └── ...
├── App.vue            # 根組件
└── main.js            # 入口文件
```

### 代碼規範
- 使用ESLint + Prettier保持代碼風格一致
  - 配置.eslintrc和.prettierrc確保團隊一致性
- 使用TypeScript提高代碼質量和開發效率
  - 定義清晰的接口和類型
- 遵循Vue 3的組合式API最佳實踐
  - 使用setup函數或<script setup>語法
- 組件命名使用PascalCase
  - 例如：TeacherCard.vue
- 文件命名使用kebab-case
  - 例如：teacher-list.vue
- 每個組件、函數和變量都需要中英文註釋
  - 說明功能、參數和返回值

### 版本控制
- 使用Git進行版本控制
- 遵循Git Flow工作流
  - main: 生產環境代碼
  - develop: 開發環境代碼
  - feature/*: 功能分支
  - release/*: 發布準備分支
  - hotfix/*: 緊急修復分支
- 提交信息格式：`類型(範圍): 描述`（中英文）
  - 例如：`feat(teacher): 新增老師搜索功能 (Add teacher search function)`
- 主要分支：main (生產)、develop (開發)、feature/* (功能)

## 7. 開發環境設置

### 開發工具
- **IDE**: VS Code
  - 推薦插件：Volar, ESLint, Prettier, GitLens
- **版本控制**: Git + GitHub
  - 使用GitHub Actions進行CI/CD
- **API測試**: Postman
  - 創建共享的API集合
- **設計工具**: Figma
  - 組件設計和原型

### 開發環境配置
- Node.js v16+
  - 使用nvm管理Node.js版本
- Vue CLI / Vite
  - 優先使用Vite提高開發效率
- Docker (用於後端開發)
  - 使用docker-compose管理服務
- MongoDB (本地或Docker)
  - 使用MongoDB Compass進行可視化管理

### 開發流程
1. 需求分析與設計
   - 明確功能需求和技術方案
2. 任務拆分與分配
   - 使用敏捷方法進行任務管理
3. 代碼實現
   - 遵循代碼規範和最佳實踐
4. 代碼審查
   - 通過Pull Request進行代碼審查
5. 測試與修復
   - 單元測試和集成測試
6. 合併與部署
   - 自動化部署流程

## 8. 文檔與溝通

### 項目文檔
- 系統架構文檔
  - 描述系統整體架構和技術選型
- API文檔 (使用Swagger)
  - 自動生成API文檔
- 組件文檔 (使用Storybook)
  - 可視化組件庫
- 開發指南
  - 新開發人員入門指南

### 溝通工具
- 項目管理：Jira/Trello
  - 任務跟踪和進度管理
- 團隊溝通：Slack/Discord
  - 日常溝通和問題討論
- 文檔協作：Notion/Confluence
  - 知識庫和文檔管理

## 9. 開發日誌管理

在項目根目錄創建`devlog`文件夾，包含以下文件：
- `README.md`: 開發日誌總覽
- `YYYY-MM-DD.md`: 每日開發日誌
- `milestones.md`: 里程碑記錄

每個開發日誌應包含：
- 已完成任務（標記✅）
- 進行中任務（標記🔄）
- 遇到的問題與解決方案
- 下一步計劃

## 10. 風險評估與應對策略

### 潛在風險
1. **技術風險**: 新技術學習曲線
   - 可能導致開發進度延遲
   - 代碼質量不穩定

2. **進度風險**: 功能開發延遲
   - 需求變更頻繁
   - 資源分配不足

3. **整合風險**: LINE API整合複雜性
   - API限制和變更
   - 用戶體驗一致性挑戰

4. **性能風險**: 位置追蹤系統性能問題
   - 實時數據處理壓力
   - 移動設備電池消耗

### 應對策略
1. 提前進行技術調研和原型驗證
   - 關鍵技術點先行驗證
   - 建立技術分享機制

2. 採用敏捷開發方法，定期回顧和調整
   - 每週進行進度回顧
   - 靈活調整任務優先級

3. 優先開發核心功能，確保基礎系統穩定
   - MVP原則，先實現核心價值
   - 模塊化設計，降低耦合度

4. 進行階段性測試和性能優化
   - 定期進行性能測試
   - 針對性能瓶頸進行優化 