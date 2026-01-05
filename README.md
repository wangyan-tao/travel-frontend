# 青春旅贷 - 大学生旅游贷款平台

## 项目简介

青春旅贷是一个专为大学生设计的旅游贷款服务平台，采用前后端分离架构，提供安全、便捷的贷款申请和还款管理服务。

## 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui
- **路由**: Wouter
- **HTTP客户端**: Axios
- **OCR识别**: Tesseract.js
- **摄像头**: react-webcam

### 后端
- **框架**: Java 8 + Spring Boot 2.7.18
- **安全**: Spring Security + JWT
- **ORM**: MyBatis
- **数据库**: MySQL 8.0
- **连接池**: Druid
- **API文档**: SpringDoc OpenAPI (Swagger)

## 项目结构

```
qingchun_travel_loan/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── ui/           # UI组件库
│   │   │   └── IDCardOCR.tsx # OCR识别组件
│   │   ├── pages/            # 页面
│   │   │   ├── Home.tsx      # 首页
│   │   │   ├── Login.tsx     # 登录
│   │   │   ├── Register.tsx  # 注册
│   │   │   ├── IdentityVerification.tsx  # 实名认证
│   │   │   ├── GuarantorInfo.tsx         # 担保人信息
│   │   │   ├── LoanProducts.tsx          # 贷款产品
│   │   │   ├── LoanApplication.tsx       # 贷款申请
│   │   │   ├── RepaymentManagement.tsx   # 还款管理
│   │   │   └── admin/
│   │   │       └── Dashboard.tsx         # 管理后台
│   │   ├── lib/
│   │   │   └── axios.ts      # HTTP配置
│   │   └── App.tsx           # 路由配置
│   └── package.json
│
└── qingchun_travel_loan_backend/  # 后端项目
    ├── src/main/java/com/qingchun/travelloan/
    │   ├── config/           # 配置类
    │   ├── controller/       # 控制器
    │   ├── service/          # 服务层
    │   ├── mapper/           # Mapper接口
    │   ├── entity/           # 实体类
    │   ├── dto/              # 数据传输对象
    │   ├── vo/               # 视图对象
    │   ├── utils/            # 工具类
    │   ├── security/         # 安全相关
    │   └── exception/        # 异常处理
    ├── src/main/resources/
    │   ├── mapper/           # MyBatis XML
    │   ├── application.yml   # 配置文件
    │   └── schema.sql        # 数据库脚本
    └── pom.xml
```

## 核心功能

### 用户端
1. **用户注册登录** - 手机号注册，JWT认证
2. **实名认证** - 身份证和学生证上传，OCR自动识别
3. **担保人信息** - 担保人信息填写，电子知情同意书
4. **贷款产品** - 按场景、额度、利率分类浏览
5. **贷款申请** - 在线提交申请，实时查看审批进度
6. **还款管理** - 还款进度可视化，还款记录查询

### 管理端
1. **用户管理** - 查看用户信息，核验状态管理
2. **贷款审批** - 审核贷款申请，查看资质材料
3. **数据统计** - 用户统计、贷款统计、还款分析

## 快速开始

### 前端启动

```bash
cd qingchun_travel_loan
pnpm install
pnpm dev
```

访问: http://localhost:3000

### 后端启动

1. 创建MySQL数据库并执行初始化脚本:
```bash
mysql -u root -p < qingchun_travel_loan_backend/src/main/resources/schema.sql
```

2. 修改配置文件 `application.yml` 中的数据库连接信息

3. 启动Spring Boot应用:
```bash
cd qingchun_travel_loan_backend
mvn spring-boot:run
```

访问API文档: http://localhost:8080/api/swagger-ui.html

## 默认账号

**管理员账号**:
- 用户名: admin
- 密码: admin123

## 数据库设计

系统包含以下核心表:
- user - 用户表
- user_identity - 用户实名信息表
- guarantor - 担保人信息表
- user_location - 位置信息表
- loan_product - 贷款产品表
- loan_application - 贷款申请表
- repayment_plan - 还款计划表
- repayment_record - 还款记录表
- part_time_job - 兼职商铺表
- user_job_proof - 用户兼职证明表
- academic_honor - 学业荣誉证明表
- notification - 通知消息表

详细表结构请查看 `schema.sql`

## OCR识别功能

系统集成了Tesseract.js进行身份证OCR识别:
- 支持拍照和相册上传
- 自动识别姓名、身份证号等信息
- 支持中文识别
- 自动填充表单

## API文档

后端API文档详见 `API_DOCUMENTATION.md`

主要接口:
- `/auth/register` - 用户注册
- `/auth/login` - 用户登录
- `/identity/submit` - 提交实名信息
- `/guarantor/submit` - 提交担保人信息
- `/loan-products` - 获取贷款产品列表
- `/loan-applications` - 提交贷款申请
- `/repayment-plans` - 查询还款计划

## 开发说明

### 前端开发
- 使用shadcn/ui组件库，保持UI一致性
- 所有API调用通过axios实例，自动处理token
- 使用TypeScript确保类型安全

### 后端开发
- 遵循RESTful API设计规范
- 使用JWT进行身份认证
- 统一异常处理和响应格式
- MyBatis进行数据库操作

## 安全特性

- JWT token认证
- 密码BCrypt加密
- CORS跨域配置
- SQL注入防护
- 文件上传大小限制
- 图片格式验证

## 部署说明

### 前端部署
```bash
pnpm build
# 将dist目录部署到静态服务器
```

### 后端部署
```bash
mvn clean package
java -jar target/travel-loan-1.0.0.jar
```

## 许可证

MIT License

## 联系方式

项目维护: Qingchun Team
