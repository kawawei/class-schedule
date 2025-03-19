# 使用 Node.js 官方鏡像作為基礎鏡像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴（包含開發依賴）
RUN npm install

# 複製源代碼
COPY . .

# 暴露端口
EXPOSE 3006

# 啟動開發服務器
CMD ["npm", "run", "dev"] 