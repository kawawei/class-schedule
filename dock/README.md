# Docker 配置說明 (Docker Configuration Guide)

本目錄包含才藝老師管理系統的 Docker 配置文件，分為本地開發環境和服務器生產環境。

## 目錄結構 (Directory Structure)

```
dock/
├── local/                      # 本地開發環境配置
│   ├── docker-compose.yml      # 本地 Docker Compose 配置
│   └── mysql-init/             # MySQL 初始化腳本
│       └── 01-init.sql         # 數據庫初始化 SQL
│
├── server/                     # 服務器生產環境配置
│   ├── docker-compose.yml      # 服務器 Docker Compose 配置
│   ├── .env.example            # 環境變量模板
│   └── mysql-init/             # MySQL 初始化腳本
│       └── 01-init.sql         # 數據庫初始化 SQL
│
└── README.md                   # 本文件
```

## 本地開發環境 (Local Development Environment)

### 啟動服務 (Start Services)

```bash
cd dock/local
docker-compose up -d
```

### 停止服務 (Stop Services)

```bash
cd dock/local
docker-compose down
```

### 重建容器 (Rebuild Containers)

當有代碼更新時，需要重新構建容器：

```bash
cd dock/local
docker-compose down
docker-compose up -d --build
```

## 服務器生產環境 (Server Production Environment)

### 準備工作 (Preparation)

1. 複製環境變量模板並設置密碼：

```bash
cd dock/server
cp .env.example .env
# 編輯 .env 文件，設置安全的密碼和密鑰
```

### 啟動服務 (Start Services)

```bash
cd dock/server
docker-compose up -d
```

### 停止服務 (Stop Services)

```bash
cd dock/server
docker-compose down
```

### 重建容器 (Rebuild Containers)

當有代碼更新時，需要重新構建容器：

```bash
cd dock/server
docker-compose down
docker-compose up -d --build
```

## 常見問題 (Common Issues)

### 端口衝突 (Port Conflict)

如果出現端口衝突，可以修改 docker-compose.yml 文件中的端口映射。

### 數據庫連接問題 (Database Connection Issues)

確保數據庫服務已啟動，並且環境變量設置正確。

### 容器日誌 (Container Logs)

查看容器日誌以排查問題：

```bash
docker logs talent-frontend-dev
docker logs talent-backend-dev
docker logs talent-mysql-dev
``` 