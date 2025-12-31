# 后端API文档

## 环境要求

- Node.js 18+
- MySQL 8.0+ (或使用MariaDB 10.3+)

## 安装步骤

1. 安装依赖
```bash
npm install
```

2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
DATABASE_URL="mysql://user:password@localhost:3306/ecommerce"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-email-authorization-code"
SMTP_FROM="your-email@qq.com"
FRONTEND_URL="http://localhost:5173"
```

3. 初始化数据库

```bash
# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate
```

4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

## API端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 商品
- `GET /api/products` - 获取商品列表（支持搜索、筛选、分页）
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品（管理员）
- `PUT /api/products/:id` - 更新商品（管理员）
- `DELETE /api/products/:id` - 删除商品（管理员）
- `GET /api/products/categories/list` - 获取分类列表

### 购物车
- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加商品到购物车
- `PUT /api/cart/:id` - 更新购物车项数量
- `DELETE /api/cart/:id` - 删除购物车项
- `DELETE /api/cart` - 清空购物车

### 订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `POST /api/orders/:id/pay` - 模拟支付

### 管理员
- `GET /api/admin/orders` - 获取所有订单
- `PUT /api/admin/orders/:id/status` - 更新订单状态
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/users/:id` - 获取用户详情
- `GET /api/admin/statistics` - 获取销售统计

### 用户
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新当前用户信息

## 创建管理员账户

可以通过Prisma Studio创建管理员账户：

```bash
npm run db:studio
```

在Prisma Studio中，找到User表，创建一个新用户，将role字段设置为 `ADMIN`。

或者使用SQL：

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

