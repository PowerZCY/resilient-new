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

## UI设计与组件

应用采用现代化、简约而优雅的设计风格，遵循JetBrains设计语言，注重用户体验和视觉一致性。

### 核心组件

#### 时间轴组件 (Timeline)
- **设计特点**：垂直流动的时间轴，展示用户记录的积极事件
- **交互体验**：
  - 平滑的滚动加载动画
  - 渐进式内容显示，新条目以淡入效果呈现
  - 虚拟列表渲染，确保大量数据下的性能表现
- **视觉元素**：
  - 每个条目使用卡片式设计，带有轻微阴影和圆角
  - 时间标记使用醒目的颜色区分
  - 内容区域采用清晰的排版和适当的留白

#### 进度指示器 (ProgressIndicator)
- **设计特点**：球形进度指示器，展示数据加载状态和当前选中项
- **交互体验**：
  - 平滑的动画过渡
  - 悬停时显示详细信息的工具提示
- **视觉元素**：
  - 外圆内圆的同心圆设计
  - 动态颜色反馈，根据加载进度变化
  - 当前选中项的高亮指示

#### 用户切换器 (NicknameFilter)
- **设计特点**：
  - 标签式切换界面，取代传统下拉菜单，提供更直观的用户身份切换
  - 结合用户图标与文本标签，增强视觉识别度
  - 渐变背景提供高端感，同时通过颜色变化传达状态信息
  - 紧凑而优雅的布局，占用适量空间同时保持视觉吸引力
  - 无缝集成到应用顶部导航区域，便于随时切换用户身份

- **交互体验**：
  - 点击切换用户时的平滑过渡动画，使用Framer Motion实现状态变化的视觉连贯性
  - 悬停状态提供轻微的缩放和背景变化，增强可点击感
  - 点击状态有明确的视觉反馈，包括背景色变化和指示点移动
  - 切换用户后，相关数据（时间轴、热力图等）随之更新，保持上下文一致性
  - 当前选中用户状态持久化到URL参数，支持页面刷新后保持选择状态

- **视觉元素**：
  - 渐变背景采用从粉色到靛蓝的过渡，创造现代感和活力
  - 活跃用户通过白色背景、颜色点和文本样式变化进行三重标识
  - 圆形用户图标区域使用动态颜色，根据当前选中的用户变化
  - 图标周围的微妙光晕动画，增强视觉层次和焦点
  - 文本标签使用清晰的字体和适当的字重，确保在各种屏幕尺寸下的可读性

- **技术实现**：
  - 基于React状态管理和Next.js路由系统构建
  - 使用URL查询参数（`?nickname=用户名`）存储当前选择，支持页面间导航和刷新
  - 组件内部使用`useSearchParams`和`useRouter`钩子处理路由状态
  - 防抖处理确保频繁切换时不会触发过多的路由更新
  - 首次加载时自动设置默认用户，确保应用始终有有效的用户上下文

- **可定制性**：
  - 用户数据（名称和颜色）通过配置对象定义，易于扩展或修改
  - 视觉样式通过Tailwind类和内联样式组合实现，便于主题调整
  - 组件结构模块化，可根据需要添加或移除功能（如用户头像、附加信息等）
  - 动画参数可调整，以适应不同的性能需求或视觉偏好

- **适用场景**：
  - 多用户共享设备的应用，需要快速切换用户身份
  - 需要在不同角色或视角间切换的仪表板或管理界面
  - 家庭共享应用，如家庭记事本、共享日历等
  - 任何需要优雅用户切换解决方案的现代Web应用

#### 热力图 (Heatmap)
- **设计特点**：日历式热力图，直观展示记录频率
- **交互体验**：
  - 悬停时显示具体日期和记录数量
  - 点击可跳转到对应日期的详细记录
- **视觉元素**：
  - 颜色深浅表示记录密度
  - 网格布局确保日期对齐
  - 月份和星期标记清晰可辨

### 页面设计

#### 首页
- **布局**：分区设计，顶部为用户切换和统计概览，中部为时间轴，右侧为热力图
- **响应式**：在不同屏幕尺寸下自动调整布局，确保最佳显示效果
- **主题**：明亮的背景色调，搭配柔和的强调色，创造积极愉悦的氛围

#### 新建记录页面
- **布局**：简洁的表单设计，聚焦于内容创建
- **交互**：实时预览和表单验证，提供即时反馈
- **辅助功能**：日期选择器、富文本编辑器和表情选择器

### 设计原则
- **一致性**：所有组件遵循统一的设计语言，包括颜色、字体和间距
- **可访问性**：符合WCAG标准，确保不同能力用户都能顺畅使用
- **性能优先**：优化渲染和动画，确保流畅的用户体验
- **直观操作**：减少学习成本，界面元素功能一目了然

### 动画与过渡
- 使用Framer Motion实现平滑的状态转换和微交互
- 加载状态采用渐进式动画，减少用户等待感
- 页面切换时的过渡效果，增强导航连贯性

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
创建 `.env.local` 文件，添加以下配置：
```plaintext
# 数据库连接
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/your-database"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/your-database"

# JWT配置
JWT_SECRET="your_secure_jwt_secret_key_here"

# Cookie配置
COOKIE_MAX_AGE_DAYS="7"
COOKIE_REMEMBER_ME_DAYS="30"

# 用户凭据配置
USER1_ID="1"
USER1_USERNAME="admin"
USER1_PASSWORD="admin123"
USER1_NICKNAME="Zia慢成"

USER2_ID="2"
USER2_USERNAME="user"
USER2_PASSWORD="user123"
USER2_NICKNAME="帝八哥"

# API配置
API_DEFAULT_PAGE_SIZE="20"
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

##登录鉴权
- 一期简单实现
  - 角色设计：
    用户：系统的最终使用者
    前端：Next.js应用的客户端部分
    Middleware：Next.js的中间件，负责请求拦截和JWT验证
    秘钥配置文件(.env.local)：存储JWT_SECRET等敏感信息
  - JWT认证流程：
    用户登录成功后，服务端生成JWT令牌并返回
    前端将JWT令牌存储在Cookie中
    所有API请求都会经过Middleware检查
    Middleware负责验证JWT令牌的有效性
  - Middleware实现要点：
    扩展现有的middleware.ts，增加JWT验证逻辑
    对于API请求，检查Cookie中的JWT令牌
    使用环境变量中的JWT_SECRET验证令牌
    验证失败时返回401错误
  - 登出流程：
    用户点击界面上的用户图标
    系统弹出确认对话框，询问用户是否确认登出
    用户确认后，前端发送POST请求到/api/auth/logout
    服务端清除认证Cookie
    前端重定向到登录页面
  - 安全考虑：
    JWT令牌应设置适当的过期时间
    Cookie应使用HttpOnly和Secure标志
    敏感API应使用CSRF保护
```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端应用
    participant Middleware as Middleware
    participant API as API服务
    participant ENV as .env.local

    %% 初始化阶段
    Note over Middleware,ENV: 应用启动时
    Middleware->>ENV: 读取JWT密钥
    ENV->>Middleware: 返回JWT_SECRET

    %% 登录流程
    User->>Frontend: 访问应用
    Frontend->>Frontend: 检查Cookie中的JWT令牌
    
    alt 无有效令牌
        Frontend->>Frontend: 显示登录界面
        User->>Frontend: 输入用户名和密码
        Frontend->>API: 发送登录请求 POST /api/auth/login
        
        Note over API,Middleware: API请求经过Middleware
        Middleware->>API: 转发请求(添加X-Request-ID)
        
        API->>API: 验证用户凭证
        
        alt 验证成功
            API->>API: 生成JWT令牌(使用JWT_SECRET签名)
            API->>Frontend: 返回成功响应和JWT令牌
            Frontend->>Frontend: 将JWT令牌存储在Cookie中
            Frontend->>User: 显示登录成功，重定向到主页
        else 验证失败
            API->>Frontend: 返回401错误
            Frontend->>User: 显示登录失败信息
        end
    else 有有效令牌
        Frontend->>User: 直接显示应用内容
    end
    
    %% 受保护资源访问流程
    User->>Frontend: 请求受保护资源
    Frontend->>API: 发送API请求(Cookie中包含JWT令牌)
    
    Note over API,Middleware: 所有API请求经过Middleware
    Middleware->>Middleware: 从Cookie中提取JWT令牌
    Middleware->>Middleware: 使用JWT_SECRET验证令牌
    
    alt 令牌有效
        Middleware->>API: 转发请求(添加用户信息)
        API->>API: 处理业务逻辑
        API->>Frontend: 返回请求的资源
        Frontend->>User: 显示资源
    else 令牌无效或过期
        Middleware->>Frontend: 返回401未授权
        Frontend->>Frontend: 清除无效令牌
        Frontend->>Frontend: 显示登录界面
        User->>Frontend: 重新登录
    end
    
    %% 登出流程
    User->>Frontend: 点击登出
    Frontend->>Frontend: 清除Cookie中的JWT令牌
    Frontend->>API: 发送登出请求 POST /api/auth/logout
    API->>Frontend: 返回登出成功
    Frontend->>User: 重定向到登录页面
```

- 后期构建标准SSO
```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 客户端应用
    participant SSO as SSO服务
    participant Auth as 认证服务
    participant IdP as 身份提供商
    participant API as API服务
    participant DB as 用户数据库

    %% 初始访问流程
    User->>Client: 访问应用
    Client->>Client: 检查本地会话
    
    alt 无有效会话
        Client->>SSO: 重定向到SSO登录页
        SSO->>SSO: 检查SSO会话Cookie
        
        alt 无SSO会话
            SSO->>User: 显示登录选项
            
            alt 选择第三方登录
                User->>SSO: 选择身份提供商(如GitHub)
                SSO->>IdP: 重定向到IdP登录页
                IdP->>User: 请求用户凭证
                User->>IdP: 提供凭证
                IdP->>IdP: 验证凭证
                IdP->>SSO: 返回认证码
                SSO->>IdP: 使用认证码请求令牌
                IdP->>SSO: 返回访问令牌和用户信息
            else 选择账号密码登录
                User->>SSO: 输入用户名和密码
                SSO->>Auth: 验证凭证
                Auth->>DB: 查询用户信息
                DB->>Auth: 返回用户数据
                Auth->>Auth: 验证密码
                Auth->>SSO: 返回认证结果
            end
            
            SSO->>DB: 查找/创建用户记录
            DB->>SSO: 返回用户ID和角色
            SSO->>SSO: 生成JWT令牌和刷新令牌
            SSO->>SSO: 设置SSO会话Cookie
        else 有SSO会话
            SSO->>SSO: 验证会话有效性
        end
        
        SSO->>Client: 重定向回应用(带授权码)
        Client->>SSO: 使用授权码请求令牌
        SSO->>Client: 返回访问令牌和刷新令牌
        Client->>Client: 存储令牌(localStorage/Cookie)
    else 有有效会话
        Client->>Client: 继续使用现有会话
    end
    
    %% API访问流程
    User->>Client: 请求受保护资源
    Client->>API: 请求API(带访问令牌)
    API->>API: 验证令牌
    
    alt 令牌有效
        API->>DB: 查询所需数据
        DB->>API: 返回数据
        API->>Client: 返回请求的资源
        Client->>User: 显示资源
    else 令牌无效或过期
        API->>Client: 返回401未授权
        Client->>SSO: 使用刷新令牌请求新访问令牌
        
        alt 刷新令牌有效
            SSO->>Client: 返回新的访问令牌
            Client->>API: 重新请求API(带新令牌)
            API->>Client: 返回请求的资源
            Client->>User: 显示资源
        else 刷新令牌无效
            SSO->>Client: 返回认证错误
            Client->>SSO: 重定向到SSO登录页
        end
    end
    
    %% 登出流程
    User->>Client: 请求登出
    Client->>Client: 清除本地令牌
    Client->>SSO: 请求SSO登出
    SSO->>SSO: 清除SSO会话
    SSO->>IdP: 请求IdP登出(可选)
    SSO->>Client: 返回登出成功
    Client->>User: 显示登出成功页面
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
