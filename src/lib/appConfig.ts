/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// 菜单项类型定义
export type MenuItem = {
  key: string;        // 唯一标识，也用作国际化翻译键
  href: string;       // 链接地址
  children?: MenuItem[]; // 子菜单项
  external?: boolean; // 是否为外部链接
};

// 菜单配置
const menu: MenuItem[] = [
  {
    key: '征途',
    href: '/blog',
  },
  // {
  //   key: 'docs',
  //   href: '/docs',
  //   children: [
  //     {
  //       key: 'gettingStarted',
  //       href: '/docs/getting-started',
  //     },
  //     {
  //       key: 'guides',
  //       href: '/docs/guides',
  //     },
  //     {
  //       key: 'apiReference',
  //       href: '/docs/api',
  //     },
  //   ],
  // }
];

/**
 * 应用配置对象，集中管理所有环境变量和配置项
 */
export const appConfig = {
  // 国际化配置
  i18n: {
    locales: ["zh", "en"] as const,
    defaultLocale: "zh" as const,
    localeLabels: {
      zh: "简体中文",
      en: "English"
    },
  },
  // 博客配置
  blog: {
    // 博客相关路径
    dir: 'public/md',
    config: 'public/md/blog-config.json',
    // 标签定义: 决定了翻译文件字段
    tags: [
      'makeMoney',
      'roadOverSea',
      'productUpdates',
      'insights',
      'tutorials'
    ],
    // 图片资源路径
    images: {
      default: '/images/default.webp',
      defaultAvatar: '/images/avatars/default.webp'
    },
    getTagDisplayCount: (_locale: string) => {
      return 2;
    },
    pageConfig: {
      size: 2
    }
  },
  // 菜单配置
  menu: menu,

  // JWT配置
  JWT_SECRET: process.env.JWT_SECRET || '',

  // Cookie配置
  COOKIE_MAX_AGE_DAYS: parseInt(process.env.COOKIE_MAX_AGE_DAYS || '7', 10),
  COOKIE_REMEMBER_ME_DAYS: parseInt(process.env.COOKIE_REMEMBER_ME_DAYS || '30', 10),

  // 数据库配置
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL || '',
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING || '',

  // 用户配置
  USER1: {
    id: process.env.USER1_ID || '1',
    username: process.env.USER1_USERNAME || '',
    password: process.env.USER1_PASSWORD || '',
    nickname: process.env.USER1_NICKNAME || process.env.USER1_USERNAME || ''
  },

  USER2: {
    id: process.env.USER2_ID || '2',
    username: process.env.USER2_USERNAME || '',
    password: process.env.USER2_PASSWORD || '',
    nickname: process.env.USER2_NICKNAME || process.env.USER2_USERNAME || ''
  },

  // 环境配置
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // API配置
  API_DEFAULT_PAGE_SIZE: parseInt(process.env.API_DEFAULT_PAGE_SIZE || '20', 10),

  /**
   * 获取配置的用户列表
   */
  getConfiguredUsers() {
    const users = [];

    // 添加第一个用户（如果配置了）
    if (this.USER1.username && this.USER1.password) {
      users.push({
        id: this.USER1.id,
        username: this.USER1.username,
        password: this.USER1.password,
        nickname: this.USER1.nickname
      });
    }

    // 添加第二个用户（如果配置了）
    if (this.USER2.username && this.USER2.password) {
      users.push({
        id: this.USER2.id,
        username: this.USER2.username,
        password: this.USER2.password,
        nickname: this.USER2.nickname
      });
    }

    return users;
  },

  /**
   * 获取默认用户（仅用于开发环境）
   */
  getDefaultUsers() {
    return [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        nickname: 'Zia慢成'
      },
      {
        id: '2',
        username: 'user',
        password: 'user123',
        nickname: '帝八哥'
      }
    ];
  },

  /**
   * 计算Cookie过期时间（秒）
   */
  getCookieMaxAge(rememberMe: boolean): number {
    const secondsInDay = 24 * 60 * 60;
    return rememberMe
      ? this.COOKIE_REMEMBER_ME_DAYS * secondsInDay
      : this.COOKIE_MAX_AGE_DAYS * secondsInDay;
  }
} as const;

// 辅助函数：检查是否为支持的语言
function isSupportedLocale(locale: string): locale is typeof appConfig.i18n.locales[number] {
  return (appConfig.i18n.locales as readonly string[]).includes(locale);
}

// 辅助函数：获取有效的语言设置
// 如果当前语言不支持，则返回默认语言
export function getValidLocale(locale: string): typeof appConfig.i18n.locales[number] {
  return isSupportedLocale(locale) ? locale : appConfig.i18n.defaultLocale;
}