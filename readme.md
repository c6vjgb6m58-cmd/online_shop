# B2C电子商务网站

**学号：** 202330450371  
**姓名：** 邓卓然

## 项目概述

一个支持顾客购买和销售管理的B2C电子商务网站，支持在线交易、订单跟踪、后台管理等功能。

## 技术栈

### 前端
- **React 18** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router** - 单页应用路由
- **Axios** - HTTP客户端
- **Recharts** - 数据可视化图表库
- **Zustand** - 轻量级状态管理

### 后端
- **Node.js** + **Express** + **TypeScript** - 服务器端框架
- **MySQL** - 关系型数据库
- **Prisma** - 现代化ORM工具
- **JWT** - JSON Web Token身份认证
- **bcrypt** - 密码加密
- **Nodemailer** - 邮件服务
- **Zod** - 数据验证库

## 项目结构

```
在线购物网站/
├── frontend/                    # React前端应用
│   ├── src/
│   │   ├── api/                # API调用封装
│   │   │   └── api.ts          # 统一的API接口定义
│   │   ├── components/          # 公共组件
│   │   │   └── Layout.tsx     # 布局组件（导航栏、页脚）
│   │   ├── pages/              # 页面组件
│   │   │   ├── Home.tsx        # 首页
│   │   │   ├── Products.tsx    # 商品列表页
│   │   │   ├── ProductDetail.tsx # 商品详情页
│   │   │   ├── Cart.tsx        # 购物车页
│   │   │   ├── Checkout.tsx    # 结算页
│   │   │   ├── Orders.tsx      # 订单列表页
│   │   │   ├── OrderDetail.tsx # 订单详情页
│   │   │   ├── Login.tsx       # 登录页
│   │   │   ├── Register.tsx    # 注册页
│   │   │   └── admin/          # 管理后台页面
│   │   │       ├── Dashboard.tsx    # 管理后台首页
│   │   │       ├── Products.tsx     # 商品管理
│   │   │       ├── Orders.tsx       # 订单管理
│   │   │       ├── Users.tsx        # 用户管理
│   │   │       └── Statistics.tsx   # 销售统计
│   │   ├── store/              # 状态管理
│   │   │   └── authStore.ts    # 用户认证状态管理
│   │   ├── App.tsx              # 主应用组件（路由配置）
│   │   ├── main.tsx             # 应用入口
│   │   └── index.css            # 全局样式
│   ├── package.json             # 前端依赖配置
│   ├── vite.config.ts           # Vite构建配置
│   └── tsconfig.json            # TypeScript配置
│
├── backend/                     # Node.js后端API
│   ├── src/
│   │   ├── routes/              # 路由定义
│   │   │   ├── auth.ts          # 用户认证路由（注册/登录）
│   │   │   ├── products.ts      # 商品管理路由
│   │   │   ├── cart.ts          # 购物车路由
│   │   │   ├── orders.ts        # 订单路由
│   │   │   ├── admin.ts         # 管理员路由（订单/用户/统计）
│   │   │   └── users.ts         # 用户信息路由
│   │   ├── utils/               # 工具函数
│   │   │   ├── auth.ts          # JWT认证工具（生成/验证token）
│   │   │   └── email.ts         # 邮件发送工具
│   │   └── index.ts             # 服务器入口文件
│   ├── prisma/
│   │   └── schema.prisma        # 数据库模型定义
│   ├── package.json             # 后端依赖配置
│   └── tsconfig.json            # TypeScript配置
│
├── README.md                    # 项目说明文档
└── 需求.md                      # 需求文档
```

## 源代码说明

### 后端架构

#### 1. 数据库模型（`prisma/schema.prisma`）

定义了6个主要数据模型：

- **User（用户）**：存储用户信息，包括邮箱、用户名、密码、角色（CUSTOMER/ADMIN）
- **Product（商品）**：存储商品信息，包括名称、描述、价格、库存、图片、分类
- **CartItem（购物车项）**：存储用户购物车中的商品和数量
- **Order（订单）**：存储订单信息，包括状态、总金额、收货信息
- **OrderItem（订单项）**：存储订单中的商品详情（价格快照）
- **UserLog（用户日志）**：记录用户行为，如浏览商品、购买记录

#### 2. 路由模块（`src/routes/`）

- **auth.ts**：处理用户注册、登录、获取当前用户信息
  - `POST /api/auth/register` - 用户注册
  - `POST /api/auth/login` - 用户登录
  - `GET /api/auth/me` - 获取当前用户信息

- **products.ts**：商品管理，支持搜索、筛选、分页
  - `GET /api/products` - 获取商品列表（支持搜索、分类、价格筛选）
  - `GET /api/products/:id` - 获取商品详情
  - `POST /api/products` - 创建商品（管理员）
  - `PUT /api/products/:id` - 更新商品（管理员）
  - `DELETE /api/products/:id` - 删除商品（管理员）

- **cart.ts**：购物车管理
  - `GET /api/cart` - 获取购物车
  - `POST /api/cart` - 添加商品到购物车
  - `PUT /api/cart/:id` - 更新购物车项数量
  - `DELETE /api/cart/:id` - 删除购物车项

- **orders.ts**：订单管理
  - `POST /api/orders` - 创建订单（自动减少库存、清空购物车）
  - `POST /api/orders/:id/pay` - 模拟支付
  - `GET /api/orders` - 获取订单列表
  - `GET /api/orders/:id` - 获取订单详情

- **admin.ts**：管理员功能
  - `GET /api/admin/orders` - 获取所有订单
  - `PUT /api/admin/orders/:id/status` - 更新订单状态
  - `GET /api/admin/users` - 获取用户列表
  - `GET /api/admin/users/:id` - 获取用户详情（含日志）
  - `GET /api/admin/statistics` - 获取销售统计

#### 3. 工具模块（`src/utils/`）

- **auth.ts**：JWT认证相关
  - `generateToken()` - 生成JWT token
  - `verifyToken()` - 验证JWT token
  - `authenticate` - 认证中间件
  - `requireAdmin` - 管理员权限中间件

- **email.ts**：邮件发送
  - `sendOrderConfirmationEmail()` - 发送订单确认邮件

### 前端架构

#### 1. 页面组件（`src/pages/`）

- **Home.tsx**：首页，展示热门商品
- **Products.tsx**：商品列表页，支持搜索、筛选、分页
- **ProductDetail.tsx**：商品详情页，可加入购物车
- **Cart.tsx**：购物车页面，可修改数量、删除商品
- **Checkout.tsx**：结算页面，填写收货信息
- **Orders.tsx**：订单列表页
- **OrderDetail.tsx**：订单详情页，可支付订单

#### 2. 管理后台（`src/pages/admin/`）

- **Dashboard.tsx**：管理后台首页，功能导航
- **Products.tsx**：商品管理，支持增删改查
- **Orders.tsx**：订单管理，可更新订单状态
- **Users.tsx**：用户管理，查看用户信息和行为日志
- **Statistics.tsx**：销售统计，包含图表可视化

#### 3. 状态管理（`src/store/authStore.ts`）

使用 Zustand 管理用户认证状态：
- 存储用户信息和token
- 提供登录、注册、注销方法
- 自动处理token存储和axios header设置

#### 4. API封装（`src/api/api.ts`）

统一封装所有API调用，包括：
- 商品API（productApi）
- 购物车API（cartApi）
- 订单API（orderApi）
- 管理员API（adminApi）
- 用户API（userApi）

## 核心功能

### 顾客端功能
- ✅ 用户注册/登录/注销
- ✅ 商品浏览、搜索、筛选（按分类、价格）
- ✅ 商品详情查看
- ✅ 购物车管理（添加、修改数量、删除）
- ✅ 订单创建和支付（模拟支付）
- ✅ 订单查询和历史记录
- ✅ 订单确认邮件通知

### 管理后台功能
- ✅ 商品管理（增删改查）
- ✅ 订单管理（查看、更新状态、取消订单）
- ✅ 客户管理（查看用户信息、订单记录、行为日志）
- ✅ 销售统计报表（总销售额、订单统计、热销商品、每日趋势）
- ✅ 数据可视化图表（柱状图、折线图）

## 安全特性

- ✅ 密码加密存储（bcrypt，10轮加密）
- ✅ JWT身份认证（7天有效期）
- ✅ 会话管理
- ✅ 数据验证（Zod）
- ✅ SQL注入防护（Prisma ORM）
- ✅ CORS跨域保护

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

#### 1. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量（创建 .env 文件）
# DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"
# JWT_SECRET="your-secret-key"
# PORT=3000
# FRONTEND_URL="http://localhost:5173"

# 生成 Prisma 客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

#### 2. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 3. 创建管理员账户

使用 Prisma Studio：
```bash
cd backend
npm run db:studio
```

在浏览器中打开 Prisma Studio，找到 User 表，创建用户并将 `role` 设置为 `ADMIN`。

或使用 MySQL：
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## 部署

### 生产环境构建

**后端：**
```bash
cd backend
npm run build
pm2 start dist/index.js --name ecommerce-api
```

**前端：**
```bash
cd frontend
npm run build
# 将 dist 目录部署到 Nginx
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 数据库设计

### 表结构

- **users**：用户表（id, email, username, password, role, createdAt, updatedAt）
- **products**：商品表（id, name, description, price, stock, image, category, createdAt, updatedAt）
- **cart_items**：购物车表（id, userId, productId, quantity, createdAt, updatedAt）
- **orders**：订单表（id, userId, status, totalAmount, shippingName, shippingPhone, shippingAddress, paymentMethod, createdAt, updatedAt）
- **order_items**：订单项表（id, orderId, productId, quantity, price, createdAt）
- **user_logs**：用户日志表（id, userId, action, productId, details, createdAt）

### 关系说明

- User 1:N Order（一个用户有多个订单）
- User 1:N CartItem（一个用户有多个购物车项）
- User 1:N UserLog（一个用户有多条行为日志）
- Product 1:N CartItem（一个商品可以在多个购物车中）
- Product 1:N OrderItem（一个商品可以在多个订单中）
- Product 1:N UserLog（一个商品可以被多个用户浏览）
- Order 1:N OrderItem（一个订单包含多个订单项）

## 技术亮点

1. **类型安全**：全面使用 TypeScript，提供完整的类型检查
2. **ORM优势**：使用 Prisma 提供类型安全的数据库访问
3. **响应式设计**：使用 Tailwind CSS 实现移动端适配
4. **状态管理**：使用 Zustand 实现轻量级状态管理
5. **数据可视化**：使用 Recharts 实现销售统计图表
6. **RESTful API**：规范的 REST API 设计
7. **错误处理**：完善的错误处理和验证机制

## 开发说明

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规范
- 使用 Prettier 格式化代码

### 测试建议

- 测试用户注册和登录流程
- 测试商品浏览和搜索功能
- 测试购物车和订单流程
- 测试管理后台各项功能

## 许可证

ISC

---

**开发者：** 邓卓然  
**学号：** 202330450371  
**项目完成时间：** 2024年
