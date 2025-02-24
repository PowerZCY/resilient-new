# WindRun·Huaiin - 积极记录生活[English](README.md)

这是一个基于 Next.js 14 构建的全栈应用，用于记录生活中的积极事件和体验。

## 技术栈

### 前端
- **框架**: Next.js 14 (React 18)
- **类型系统**: TypeScript
- **UI 组件**:
  - shadcn/ui (基于 Radix UI)
  - Tailwind CSS (样式系统)
  - Lucide React (图标库)
- **数据可视化**: 
  - React Calendar Heatmap (日历热力图)
  - Tremor (数据展示组件)

### 后端
- **API**: Next.js API Routes (REST API)
- **数据库**: PostgreSQL (关系型数据库，提供强大的数据一致性和查询能力)
- **ORM**: Prisma (现代数据库工具链，提供类型安全的数据库访问)
- **日志系统**: 自定义 Logger

## 环境要求

- Node.js 18+ 
- PostgreSQL 15+ (数据库服务)
- pdadmin4 (数据库可视化工具)
- pnpm 8+ (高性能的包管理器)

## 本地开发环境搭建

1. 克隆项目并安装依赖
```bash
git clone https://github.com/PowerZCY/resilient-new/
cd resilient-new
pnpm install
```

2. 环境变量配置
创建 `.env` 文件，添加以下配置：
```plaintext
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/your-database"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/your-database"
```

3. 数据库迁移
```bash
pnpm prisma migrate dev
```

4. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 项目结构

```plaintext
src/
├── app/                   # Next.js 应用目录
│   ├── api/               # API 路由
│   ├── new/               # 新建记录页面
│   └── page.tsx           # 首页
├── components/            # React 组件
├── lib/                   # 工具函数和配置
└── middleware.ts          # Next.js 中间件
```

## API 接口文档

### 1. 获取时间轴数据
- **端点**: `/api/entries`
- **方法**: GET
- **参数**: 
  - `nickname`: 用户昵称（必填）
  - `page`: 页码（默认：1）
  - `limit`: 每页条数（默认：20）
- **响应示例**:
```json
{
  "entries": [
    {
      "id": "string",
      "date": "2024-03-20T00:00:00.000Z",
      "content": "string",
      "nickname": "string"
    }
  ],
  "total": 100
}
```

### 2. 创建新记录
- **端点**: `/api/entries`
- **方法**: POST
- **请求体**:
```json
{
  "date": "2024-03-20T00:00:00.000Z",
  "nickname": "string",
  "content": "string"
}
```

### 3. 获取热力图数据
- **端点**: `/api/entries/heatmap`
- **方法**: GET
- **参数**: 
  - `nickname`: 用户昵称（必填）
- **响应示例**:
```json
[
  {
    "id": "string",
    "date": "2024-03-20T00:00:00.000Z"
  }
]
```

## 数据库模型

```prisma
model detail {
  id        String   @id @default(cuid())
  date      DateTime
  nickname  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 部署

项目已配置为可以直接部署到 Vercel 平台：

1. 在 Vercel 中导入项目
2. 配置环境变量
3. 部署过程会自动执行数据库迁移和构建

## 开发指南

### 添加新页面
在 `src/app` 目录下创建新的目录和 `page.tsx` 文件。

### 添加新 API 端点
在 `src/app/api` 目录下创建新的目录和 `route.ts` 文件。

### 样式修改
项目使用 Tailwind CSS，配置文件位于 `tailwind.config.ts`。

### 常用命令速查

#### pnpm 命令
```bash
# 安装依赖
pnpm install

# 添加新依赖
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>

# 更新依赖
pnpm update

# 运行脚本
pnpm run <script-name>

# 清理依赖缓存
pnpm store prune
```

#### Prisma 命令
```bash
# 生成 Prisma Client
pnpm prisma generate

# 创建新的迁移
pnpm prisma migrate dev --name <migration-name>

# 部署迁移
pnpm prisma migrate deploy

# 重置数据库
pnpm prisma migrate reset

# 查看数据库
pnpm prisma studio
```

#### PostgreSQL 常用操作
```bash
# 创建数据库
creatdb <database-name>

# 删除数据库
dropdb <database-name>

# 连接数据库
psql -d <database-name>

# 常用 psql 命令
\l          # 列出所有数据库
\c <dbname> # 连接到指定数据库
\dt         # 显示所有表
\d <table>  # 显示表结构
\q          # 退出
```

## 日志系统

项目实现了一个自定义的日志系统，通过中间件自动记录所有 API 请求和响应：

- 请求日志包含：时间戳、方法、URL、查询参数、请求体等
- 响应日志包含：状态码、响应时间、响应头等
- 每个请求都有唯一的 `X-Request-ID` 用于追踪

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更，请遵循[Git提交规范](./docs/Git规范.md)
4. 推送到分支
5. 提交 Pull Request

## 许可证

[MIT](LICENSE) - Copyright (c) 2025 D8ger
