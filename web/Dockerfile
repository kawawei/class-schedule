# 使用 Node.js 16 作為基礎映像 Use Node.js 16 as base image
FROM node:16-alpine

# 設置工作目錄 Set working directory
WORKDIR /app

# 複製 package.json 和 package-lock.json 文件 Copy package.json and package-lock.json
COPY package*.json ./

# 安裝依賴 Install dependencies
RUN npm install

# 複製所有文件 Copy all files
COPY . .

# 設置環境變量 Set environment variables
ENV NODE_ENV=development

# 暴露端口 Expose port
EXPOSE 3003

# 啟動開發服務器 Start development server
CMD ["npm", "run", "dev"] 