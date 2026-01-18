# 前端 Dockerfile
# 第一阶段：构建
FROM node:18-alpine AS build

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建前端
RUN pnpm build

# 第二阶段：运行
FROM nginx:alpine

# 复制构建产物
COPY --from=build /app/dist/public /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
