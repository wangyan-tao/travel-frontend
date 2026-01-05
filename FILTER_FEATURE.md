# 图表筛选功能说明

## 功能概述

管理后台的数据分析页面现已支持按**日期范围**和**用户类型**进行数据筛选，帮助管理员更精准地查看特定时间段和用户群体的统计数据。

## 筛选条件

### 1. 日期范围筛选

- **开始日期**：选择统计数据的起始日期
- **结束日期**：选择统计数据的截止日期
- **默认值**：如果不选择，后端默认查询最近一年的数据

**使用方式：**
- 点击"开始日期"或"结束日期"按钮
- 在弹出的日历中选择日期
- 支持中文日历显示

### 2. 用户类型筛选

- **全部**：不区分用户类型，查询所有用户数据（默认）
- **学生**：仅查询在校学生的数据
- **毕业生**：仅查询已毕业学生的数据

**使用方式：**
- 点击"用户类型"下拉框
- 选择需要查看的用户类型

## 操作按钮

### 应用筛选
点击"应用筛选"按钮后，系统将根据当前选择的筛选条件重新加载统计数据，所有图表将更新为筛选后的结果。

### 重置
点击"重置"按钮将清除所有筛选条件，恢复到默认状态（查询最近一年的全部用户数据）。

## 筛选影响的数据

筛选条件将影响以下所有统计数据：

1. **概览卡片**
   - 总用户数
   - 贷款申请数
   - 待审批数
   - 总贷款额

2. **用户增长趋势图**
   - 按月显示用户增长情况
   - 仅统计筛选日期范围内的数据

3. **贷款申请状态分布**
   - 已批准、审批中、已拒绝的比例
   - 仅统计筛选日期范围内的申请

4. **贷款产品分布**
   - 各产品的申请数量
   - 仅统计筛选日期范围内的申请

5. **还款情况分析**
   - 按时还款和逾期还款的对比
   - 仅统计筛选日期范围内的还款记录

## 技术实现

### 前端实现

**组件位置：** `client/src/pages/admin/Dashboard.tsx`

**核心功能：**
- 使用 `react-day-picker` 实现日期选择器
- 使用 `date-fns` 进行日期格式化
- 使用 `shadcn/ui` 的 Select 组件实现下拉选择
- 筛选条件变化时调用 API 重新加载数据

**代码示例：**
```typescript
const [startDate, setStartDate] = useState<Date | undefined>(undefined);
const [endDate, setEndDate] = useState<Date | undefined>(undefined);
const [userType, setUserType] = useState<'ALL' | 'STUDENT' | 'GRADUATE'>('ALL');

const loadStatistics = async () => {
  const filter: StatisticsFilter = {
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    userType: userType,
  };
  const data = await statisticsApi.getFullStatistics(filter);
  setStatistics(data);
};
```

### 后端实现

**相关文件：**
- `StatisticsFilterDTO.java` - 筛选参数DTO
- `StatisticsMapper.java` - 数据访问层接口
- `StatisticsMapper.xml` - MyBatis SQL映射
- `StatisticsService.java` - 业务逻辑层
- `StatisticsController.java` - 控制器层

**API接口示例：**
```
GET /api/statistics/full?startDate=2024-01-01&endDate=2024-12-31&userType=STUDENT
```

**SQL筛选条件：**
```xml
<if test="filter.startDate != null">
    AND created_at >= #{filter.startDate}
</if>
<if test="filter.endDate != null">
    AND created_at <= #{filter.endDate}
</if>
<if test="filter.userType != null and filter.userType != 'ALL'">
    AND user_type = #{filter.userType}
</if>
```

## 使用场景

1. **季度/年度报告**：选择特定季度或年度的日期范围，生成对应时期的数据报告

2. **用户群体分析**：对比学生和毕业生两个群体的贷款行为差异

3. **趋势分析**：通过调整日期范围，观察不同时间段的业务趋势变化

4. **问题排查**：当发现某个时期数据异常时，可以精确筛选该时期进行深入分析

## 注意事项

1. **日期范围验证**：前端不限制日期范围，但建议选择合理的时间跨度以保证查询性能

2. **数据为空提示**：如果筛选条件下没有数据，页面会显示"当前筛选条件下没有数据，请尝试调整筛选条件"

3. **后端默认值**：如果不传递筛选参数，后端默认查询最近一年的全部用户数据

4. **用户类型字段**：需要在 `user_identity` 表中添加 `user_type` 字段来支持用户类型筛选

## 数据库字段要求

为了支持用户类型筛选，需要在 `user_identity` 表中添加以下字段：

```sql
ALTER TABLE user_identity ADD COLUMN user_type VARCHAR(20) DEFAULT 'STUDENT' COMMENT '用户类型：STUDENT-学生, GRADUATE-毕业生';
```

## 未来扩展

可以考虑添加以下筛选维度：

1. **院校筛选**：按学校查看数据
2. **专业筛选**：按专业查看数据
3. **贷款产品筛选**：按产品类型查看数据
4. **地区筛选**：按用户所在地区查看数据
5. **快捷日期选择**：添加"最近7天"、"最近30天"、"本月"、"本季度"等快捷按钮
