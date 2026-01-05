# 青春旅贷项目 TODO（前后端分离架构）

## 后端项目（Java + Spring Boot）
- [ ] 创建Maven项目结构
- [ ] 配置Spring Boot依赖
- [ ] 配置MySQL数据库连接
- [ ] 配置MyBatis
- [ ] 配置Spring Security和JWT
- [ ] 配置Swagger API文档
- [ ] 配置跨域CORS

## 数据库设计
- [ ] 用户表（user）
- [ ] 用户实名信息表（user_identity）
- [ ] 担保人信息表（guarantor）
- [ ] 贷款产品表（loan_product）
- [ ] 贷款申请表（loan_application）
- [ ] 还款计划表（repayment_plan）
- [ ] 还款记录表（repayment_record）
- [ ] 兼职商铺表（part_time_job）
- [ ] 学业荣誉证明表（academic_honor）
- [ ] 通知消息表（notification）

## 后端API开发
- [ ] 用户注册登录API
- [ ] 用户实名认证API（保存身份证、学生证信息）
- [ ] 学籍核验API
- [ ] 担保人信息保存API
- [ ] 电子知情同意书签署API
- [ ] 位置信息保存API
- [ ] 贷款产品列表API（分类筛选）
- [ ] 贷款产品详情API
- [ ] 贷款申请提交API
- [ ] 贷款申请进度查询API
- [ ] 兼职商铺推荐API
- [ ] 兼职证明上传API
- [ ] 学业荣誉证明上传API
- [ ] 还款计划查询API
- [ ] 还款记录查询API
- [ ] 提前还款测算API
- [ ] 管理端用户列表API
- [ ] 管理端贷款审批API
- [ ] 管理端数据统计API
- [ ] 通知消息API

## 前端开发（React）
- [x] 配置前端调用后端API（axios）
- [x] 集成OCR识别组件（身份证识别）
- [x] 用户注册登录页面
- [x] 实名认证页面（身份证、学生证上传+OCR识别）
- [x] 担保人信息填写页面
- [ ] 电子知情同意书页面
- [ ] 位置定位页面
- [x] 贷款产品列表页面
- [x] 贷款产品详情页面
- [x] 贷款申请页面
- [ ] 审批进度查询页面
- [ ] 兼职商铺推荐页面
- [ ] 证明材料上传页面
- [x] 还款管理页面（进度条、图表、日历）
- [x] 管理端用户管理页面
- [x] 管理端审批页面
- [x] 管理端数据分析页面

## UI/UX设计
- [x] 设计优雅完美风格的配色方案
- [x] 设计专业可信的视觉风格
- [x] 实现响应式布局

## 安全与合规
- [ ] JWT token认证
- [ ] 数据加密传输（HTTPS）
- [ ] 证件图片格式验证
- [ ] 图片清晰度检查
- [ ] SQL注入防护

## 测试与部署
- [ ] 后端单元测试
- [ ] 前后端联调测试
- [ ] 创建项目检查点

## 已完成项
- [x] 创建Maven项目结构
- [x] 配置Spring Boot依赖
- [x] 配置MySQL数据库连接
- [x] 配置MyBatis
- [x] 配置Spring Security和JWT
- [x] 配置Swagger API文档
- [x] 配置跨域CORS
- [x] 数据库表设计完成
- [x] 用户注册登录API


## 新增需求 - 管理后台数据可视化
- [x] 安装Recharts依赖
- [x] 创建用户增长趋势图表组件
- [x] 创建贷款统计图表组件（饼图、柱状图）
- [x] 创建还款分析图表组件
- [x] 更新管理后台Dashboard页面集成图表
- [x] 测试图表展示效果

## 新增需求 - 连接真实后端API
- [x] 创建统计数据DTO类
- [x] 创建StatisticsMapper接口和XML
- [x] 创建StatisticsService服务类
- [x] 创建StatisticsController控制器
- [x] 更新前端axios调用统计API
- [x] 更新Dashboard页面使用真实数据
- [x] 测试API和图表展示

## 新增需求 - 图表筛选功能
- [x] 创建筛选参数DTO类
- [x] 更新StatisticsMapper支持筛选条件
- [x] 更新StatisticsService处理筛选参数
- [x] 更新StatisticsController接收筛选参数
- [x] 前端添加日期范围选择器
- [x] 前端添加用户类型筛选器
- [x] 更新statisticsApi传递筛选参数
- [x] 更新Dashboard页面集成筛选功能
- [x] 测试筛选功能

## 新增需求 - 用户信息和申请流程完善
- [x] 创建用户信息下拉菜单组件
- [x] 在导航栏右上角显示用户头像和用户名
- [x] 实现退出登录功能
- [x] 完善实名认证流程（表单验证、图片上传）
- [x] 完善担保人信息填写流程
- [x] 完善贷款申请详细流程
- [x] 添加申请进度查询功能
- [x] 测试完整流程

## 新增需求 - 后端API完善和功能增强
### 后端API实现
- [ ] 创建UserIdentityMapper和Service
- [ ] 创建实名认证保存API
- [ ] 创建GuarantorMapper和Service
- [ ] 创建担保人信息保存API
- [ ] 创建LoanApplicationMapper和Service
- [ ] 创建贷款申请提交API
- [ ] 创建我的申请列表API
- [ ] 创建贷款产品列表API

### 消息通知功能
- [ ] 创建NotificationMapper和Service
- [ ] 创建通知列表API
- [ ] 创建标记已读API
- [x] 前端创建通知铃铛组件
- [x] 前端集成通知功能到导航栏
- [x] 实现未读消息数量提示

### 移动端优化
- [x] 创建响应式汉堡菜单组件
- [x] 优化导航栏移动端显示
- [x] 优化表单在移动端的布局
- [x] 优化图表在移动端的显示
- [x] 测试移动端体验

## 新增需求 - 优化数据分析页面
- [x] 优化图表配色方案，使用更清晰的颜色
- [x] 优化图表布局和间距
- [x] 添加图表动画效果
- [x] 为汇总数据卡片添加hover效果
- [x] 为汇总数据卡片添加点击跳转功能
- [x] 创建用户列表详情页面
- [x] 创建贷款申请列表详情页面
- [x] 创建还款记录列表详情页面
- [x] 测试跳转和数据展示

## Bug修复 - 嵌套a标签错误
- [x] 检查Login页面中的嵌套a标签
- [x] 修复嵌套a标签问题
- [x] 测试登录页面

## Bug修复 - 404错误和嵌套a标签
- [x] 修复NotificationBell组件的04错误处理
- [x] 修复Dashboard组件的04错误处理
- [x] 检查并修复其他页面的嵌套a标签
- [ ] 测试所有页面
