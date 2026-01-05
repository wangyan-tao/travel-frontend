# API集成说明文档

## 概述

本文档说明前端如何调用Java后端的统计API接口，实现管理后台的数据可视化功能。

## 后端API接口

### 基础URL
```
http://localhost:8080
```

### 统计API端点

#### 1. 获取完整统计数据
```
GET /api/statistics/full
```

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overview": {
      "totalUsers": 1234,
      "totalApplications": 567,
      "pendingApplications": 23,
      "totalLoanAmount": "¥2.5M"
    },
    "userGrowth": [
      { "month": "01月", "users": 120 },
      { "month": "02月", "users": 180 }
    ],
    "loanStatus": [
      { "name": "已批准", "value": 400, "color": "#10b981" },
      { "name": "审批中", "value": 120, "color": "#f59e0b" },
      { "name": "已拒绝", "value": 47, "color": "#ef4444" }
    ],
    "loanProducts": [
      { "product": "短途游贷", "count": 180 },
      { "product": "毕业旅行贷", "count": 250 }
    ],
    "repaymentStatus": [
      { "month": "01月", "onTime": 95, "late": 5 },
      { "month": "02月", "onTime": 92, "late": 8 }
    ]
  }
}
```

#### 2. 获取概览统计
```
GET /api/statistics/overview
```

#### 3. 获取用户增长数据
```
GET /api/statistics/user-growth
```

#### 4. 获取贷款状态分布
```
GET /api/statistics/loan-status
```

#### 5. 获取贷款产品分布
```
GET /api/statistics/loan-products
```

#### 6. 获取还款情况
```
GET /api/statistics/repayment-status
```

## 前端集成

### 1. API服务封装

文件位置：`client/src/lib/statisticsApi.ts`

```typescript
import axios from './axios';

export const statisticsApi = {
  getFullStatistics: async (): Promise<FullStatistics> => {
    const response = await axios.get('/api/statistics/full');
    return response.data.data;
  },
  // ... 其他方法
};
```

### 2. 在组件中使用

文件位置：`client/src/pages/admin/Dashboard.tsx`

```typescript
import { statisticsApi } from '@/lib/statisticsApi';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<FullStatistics | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await statisticsApi.getFullStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 渲染图表...
}
```

## 数据流程

1. **前端发起请求**：用户访问管理后台Dashboard页面
2. **调用API服务**：前端通过`statisticsApi.getFullStatistics()`调用后端接口
3. **后端处理**：
   - StatisticsController接收请求
   - StatisticsService调用StatisticsMapper
   - StatisticsMapper执行SQL查询
   - 返回统计数据
4. **前端渲染**：接收数据后使用Recharts渲染图表

## 错误处理

前端已实现以下错误处理机制：

- **加载状态**：显示加载动画
- **错误提示**：使用toast显示错误信息
- **重试机制**：提供刷新按钮重新加载数据
- **空数据处理**：当没有数据时显示友好提示

## 启动说明

### 启动后端
```bash
cd qingchun_travel_loan_backend
mvn spring-boot:run
```

后端将运行在 `http://localhost:8080`

### 启动前端
```bash
cd qingchun_travel_loan
pnpm dev
```

前端将运行在 `http://localhost:3000`

### 配置说明

前端axios配置文件：`client/src/lib/axios.ts`

```typescript
const axios = axiosLib.create({
  baseURL: 'http://localhost:8080',  // 后端API地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 注意事项

1. **CORS配置**：后端已配置CORS允许前端跨域访问
2. **认证**：统计API需要JWT token认证（管理员权限）
3. **数据格式**：所有API返回统一的Result格式
4. **错误码**：
   - 200: 成功
   - 401: 未认证
   - 403: 无权限
   - 500: 服务器错误

## 测试

访问 `http://localhost:3000/admin/dashboard` 查看管理后台数据可视化效果。

如果看到"暂无统计数据"提示，说明数据库中还没有数据，需要先：
1. 注册用户
2. 创建贷款产品
3. 提交贷款申请
4. 生成还款记录

## Swagger API文档

访问 `http://localhost:8080/swagger-ui.html` 查看完整的API文档和在线测试。
