# 青春旅贷前端详细启动指南

## 目录

1. [环境准备](#环境准备)
2. [项目安装](#项目安装)
3. [配置说明](#配置说明)
4. [启动项目](#启动项目)
5. [项目结构](#项目结构)
6. [开发指南](#开发指南)
7. [构建部署](#构建部署)
8. [常见问题](#常见问题)
9. [调试技巧](#调试技巧)

---

## 环境准备

### 1. 安装 Node.js

**推荐版本**: Node.js 22.x 或更高

**Windows 系统**:
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 LTS 版本安装包
3. 运行安装程序，按默认选项安装
4. 验证安装：
```cmd
node --version
npm --version
```

**macOS 系统**:
```bash
# 使用 Homebrew 安装
brew install node@22

# 验证安装
node --version
npm --version
```

**Linux 系统**:
```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# 验证安装
node --version
npm --version
```

### 2. 安装 pnpm

pnpm 是一个快速、节省磁盘空间的包管理器。

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

预期输出: `10.4.1` 或更高版本

### 3. 安装 Git（可选）

如果需要版本控制：

```bash
# Windows: 下载安装 https://git-scm.com/
# macOS: brew install git
# Linux: sudo apt-get install git

# 验证安装
git --version
```

---

## 项目安装

### 1. 获取项目代码

**方式一：从压缩包解压**
```bash
# 解压项目文件
unzip qingchun_travel_loan_complete.zip
cd qingchun_travel_loan_complete/frontend
```

**方式二：从Git仓库克隆（如果有）**
```bash
git clone <repository-url>
cd qingchun_travel_loan
```

### 2. 安装依赖

```bash
# 进入前端项目目录
cd qingchun_travel_loan

# 安装所有依赖包（首次运行需要几分钟）
pnpm install
```

**安装过程中可能看到的警告**:
- `WARN deprecated` - 某些包已过时，可以忽略
- `WARN Issues with peer dependencies` - 依赖版本不完全匹配，通常不影响运行

**如果安装失败**:
```bash
# 清除缓存后重试
pnpm store prune
rm -rf node_modules
pnpm install
```

### 3. 验证安装

```bash
# 检查是否安装成功
ls node_modules

# 应该看到大量的包目录
```

---

## 配置说明

### 1. 环境变量配置

前端项目使用两种后端连接方式：

#### 方式一：使用 Manus 内置后端（默认）

项目已配置好，无需额外设置。使用 Manus OAuth 认证。

#### 方式二：连接独立的 Java 后端

编辑 `client/src/lib/axios.ts`:

```typescript
import axiosLib from 'axios';

const axios = axiosLib.create({
  baseURL: 'http://localhost:8080',  // Java后端地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理401错误
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
```

### 2. 主题配置

编辑 `client/src/index.css` 修改配色方案：

```css
@layer base {
  :root {
    /* 主色调 - 金融蓝 */
    --primary: 210 100% 50%;
    --primary-foreground: 0 0% 100%;
    
    /* 背景色 */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    
    /* 可以根据需要修改其他颜色 */
  }
}
```

### 3. 端口配置

默认端口是 3000，如需修改：

创建 `vite.config.ts` 或编辑现有文件：

```typescript
export default defineConfig({
  server: {
    port: 3001,  // 修改为其他端口
    host: true,  // 允许外部访问
  },
});
```

---

## 启动项目

### 1. 开发模式启动

```bash
# 在项目根目录执行
pnpm dev
```

**启动成功的标志**:
```
VITE v7.1.7  ready in 1234 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.100:3000/
➜  press h + enter to show help
```

### 2. 访问应用

在浏览器中打开:
- **本地访问**: http://localhost:3000
- **局域网访问**: http://192.168.x.x:3000

### 3. 热重载

修改代码后，浏览器会自动刷新，无需手动重启。

### 4. 停止服务

在终端按 `Ctrl + C` 停止开发服务器。

---

## 项目结构

```
qingchun_travel_loan/
├── client/                      # 前端源代码目录
│   ├── public/                 # 静态资源（直接复制到根路径）
│   │   └── favicon.ico
│   ├── src/
│   │   ├── _core/              # 核心功能（认证、hooks等）
│   │   │   └── hooks/
│   │   │       └── useAuth.tsx # 认证Hook
│   │   ├── components/         # 可复用组件
│   │   │   ├── ui/            # shadcn/ui组件
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── ...
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── IDCardOCR.tsx  # OCR识别组件
│   │   ├── contexts/          # React Context
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/               # 工具库
│   │   │   ├── axios.ts       # HTTP客户端配置
│   │   │   ├── statisticsApi.ts # 统计API
│   │   │   ├── trpc.ts        # tRPC客户端
│   │   │   └── utils.ts       # 工具函数
│   │   ├── pages/             # 页面组件
│   │   │   ├── admin/         # 管理后台页面
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── Home.tsx       # 首页
│   │   │   ├── Login.tsx      # 登录页
│   │   │   ├── Register.tsx   # 注册页
│   │   │   ├── IdentityVerification.tsx # 实名认证
│   │   │   ├── GuarantorInfo.tsx # 担保人信息
│   │   │   ├── LoanProducts.tsx # 贷款产品
│   │   │   ├── LoanApplication.tsx # 贷款申请
│   │   │   ├── RepaymentManagement.tsx # 还款管理
│   │   │   └── NotFound.tsx   # 404页面
│   │   ├── App.tsx            # 路由配置
│   │   ├── main.tsx           # 应用入口
│   │   ├── index.css          # 全局样式
│   │   └── const.ts           # 常量定义
│   ├── index.html             # HTML模板
│   └── vite.config.ts         # Vite配置
├── server/                     # Node.js后端（可选）
├── drizzle/                    # 数据库Schema
├── shared/                     # 前后端共享代码
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript配置
├── tailwind.config.js         # Tailwind CSS配置
└── README.md                  # 项目说明
```

---

## 开发指南

### 1. 添加新页面

**步骤一：创建页面组件**

在 `client/src/pages/` 目录下创建新文件，例如 `MyPage.tsx`:

```typescript
export default function MyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">我的页面</h1>
      <p>页面内容...</p>
    </div>
  );
}
```

**步骤二：注册路由**

编辑 `client/src/App.tsx`:

```typescript
import MyPage from "./pages/MyPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-page" component={MyPage} />  {/* 新增路由 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

**步骤三：添加导航链接**

```typescript
import { Link } from "wouter";

<Link href="/my-page">
  <a className="text-blue-600 hover:underline">访问我的页面</a>
</Link>
```

### 2. 使用 shadcn/ui 组件

项目已集成 shadcn/ui，可以直接使用：

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>表单标题</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">姓名</Label>
            <Input id="name" placeholder="请输入姓名" />
          </div>
          <Button>提交</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. 调用后端 API

**使用 axios**:

```typescript
import axios from '@/lib/axios';

// GET 请求
const fetchData = async () => {
  try {
    const response = await axios.get('/api/data');
    console.log(response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
};

// POST 请求
const submitData = async (data: any) => {
  try {
    const response = await axios.post('/api/submit', data);
    return response.data;
  } catch (error) {
    console.error('提交失败:', error);
    throw error;
  }
};
```

**使用 tRPC（如果使用 Manus 后端）**:

```typescript
import { trpc } from '@/lib/trpc';

export default function MyComponent() {
  // 查询数据
  const { data, isLoading, error } = trpc.myQuery.useQuery();
  
  // 修改数据
  const mutation = trpc.myMutation.useMutation({
    onSuccess: () => {
      console.log('操作成功');
    },
  });
  
  const handleSubmit = () => {
    mutation.mutate({ /* 数据 */ });
  };
  
  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return <div>{/* 渲染数据 */}</div>;
}
```

### 4. 状态管理

**使用 useState**:

```typescript
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

**使用 useEffect**:

```typescript
import { useEffect, useState } from 'react';

export default function DataFetcher() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // 组件挂载时执行
    fetchData().then(setData);
    
    // 清理函数（组件卸载时执行）
    return () => {
      // 清理逻辑
    };
  }, []); // 空数组表示只执行一次
  
  return <div>{/* 渲染数据 */}</div>;
}
```

### 5. 表单处理

**使用 react-hook-form**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('邮箱格式不正确'),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });
  
  const onSubmit = (data: any) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('username')} />
      {form.formState.errors.username && (
        <p className="text-red-500">{form.formState.errors.username.message}</p>
      )}
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 构建部署

### 1. 构建生产版本

```bash
# 构建项目
pnpm build
```

构建完成后，生成的文件在 `dist/` 目录。

### 2. 预览生产版本

```bash
# 本地预览构建结果
pnpm preview
```

### 3. 部署到静态服务器

**部署到 Nginx**:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**部署到 Apache**:

在 `dist/` 目录创建 `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**部署到 Vercel**:

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

---

## 常见问题

### Q1: 启动失败，提示端口被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:

**Windows**:
```cmd
# 查找占用端口的进程
netstat -ano | findstr :3000

# 杀死进程（替换PID）
taskkill /PID <PID> /F
```

**macOS/Linux**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者修改端口
# 编辑 vite.config.ts，修改 server.port
```

### Q2: 安装依赖失败

**错误信息**:
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/...
```

**解决方案**:

```bash
# 方案一：切换到淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 方案二：清除缓存重试
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 方案三：使用 npm 代替
npm install
```

### Q3: 页面空白，控制台报错

**检查步骤**:

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页的错误信息
3. 查看 Network 标签页，检查 API 请求是否失败

**常见原因**:
- 后端未启动
- API 地址配置错误
- CORS 跨域问题

**解决方案**:
```typescript
// 检查 client/src/lib/axios.ts 中的 baseURL
const axios = axiosLib.create({
  baseURL: 'http://localhost:8080',  // 确保地址正确
});
```

### Q4: 样式不生效

**原因**: Tailwind CSS 未正确编译

**解决方案**:

```bash
# 重启开发服务器
pnpm dev

# 如果问题依旧，清除缓存
rm -rf node_modules/.vite
pnpm dev
```

### Q5: TypeScript 类型错误

**错误信息**:
```
Property 'xxx' does not exist on type 'yyy'
```

**解决方案**:

```bash
# 检查类型
pnpm check

# 如果是第三方库的类型问题，安装类型定义
pnpm add -D @types/库名
```

### Q6: 热重载不工作

**解决方案**:

```bash
# 重启开发服务器
Ctrl + C
pnpm dev

# 如果问题依旧，清除缓存
rm -rf node_modules/.vite
pnpm dev
```

---

## 调试技巧

### 1. 使用浏览器开发者工具

**打开方式**:
- Chrome/Edge: F12 或 Ctrl+Shift+I
- Firefox: F12
- Safari: Cmd+Option+I

**常用功能**:
- **Console**: 查看日志和错误
- **Network**: 查看网络请求
- **Elements**: 检查 DOM 和样式
- **Sources**: 调试 JavaScript 代码

### 2. 添加调试日志

```typescript
// 简单日志
console.log('变量值:', variable);

// 表格形式
console.table(arrayData);

// 分组日志
console.group('API 请求');
console.log('URL:', url);
console.log('Data:', data);
console.groupEnd();

// 性能测试
console.time('操作耗时');
// ... 执行操作
console.timeEnd('操作耗时');
```

### 3. React Developer Tools

**安装**:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

**使用**:
- 查看组件树
- 检查 Props 和 State
- 性能分析

### 4. 网络请求调试

**查看请求详情**:
1. 打开 Network 标签页
2. 刷新页面
3. 点击请求查看详细信息

**常见状态码**:
- 200: 成功
- 401: 未授权（Token 失效）
- 404: 接口不存在
- 500: 服务器错误

### 5. 断点调试

在代码中添加 `debugger`:

```typescript
function myFunction() {
  debugger;  // 程序会在这里暂停
  // ... 其他代码
}
```

---

## 性能优化

### 1. 代码分割

```typescript
// 使用动态导入
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 2. 图片优化

```typescript
// 使用 WebP 格式
<img src="image.webp" alt="描述" />

// 懒加载
<img src="image.jpg" loading="lazy" alt="描述" />
```

### 3. 缓存优化

```typescript
// 使用 React Query 缓存数据
const { data } = useQuery('key', fetchData, {
  staleTime: 5 * 60 * 1000,  // 5分钟内不重新请求
});
```

---

## 开发工具推荐

### 1. VS Code 插件

- **ES7+ React/Redux/React-Native snippets** - 代码片段
- **Tailwind CSS IntelliSense** - Tailwind 自动补全
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Auto Rename Tag** - 自动重命名标签

### 2. Chrome 插件

- **React Developer Tools** - React 调试
- **Redux DevTools** - Redux 调试（如果使用）
- **JSON Viewer** - JSON 格式化

---

## 下一步

- 阅读 [API集成文档](./API_INTEGRATION.md) 了解前后端对接
- 阅读 [筛选功能说明](./FILTER_FEATURE.md) 了解图表筛选
- 查看 [shadcn/ui 文档](https://ui.shadcn.com/) 学习组件使用
- 查看 [Tailwind CSS 文档](https://tailwindcss.com/) 学习样式编写

---

## 技术支持

如有问题，请查看：
- 项目 README
- API 文档
- 或在开发者工具中查看错误信息

**祝您开发愉快！** 🎉
