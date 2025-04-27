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
    // 图片资源路径
    images: {
      default: '/images/default.webp',
      defaultAvatar: '/images/avatars/default.webp'
    },
    getTagDisplayCount: (_locale: string) => {
      return 2;
    },
    pageConfig: {
      size: 4
    }
  },
  // 菜单配置
  menu: menu,

  clerk: {
    debug: process.env.CLERK_DEBUG === 'true',
    userIds: [
      process.env.CLERK_FORCE_USER_ID1, 
      process.env.CLERK_FORCE_USER_ID2
    ]
  },

  // 数据库配置
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL || '',
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING || '',

  // 环境配置
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',

  // API配置
  API_DEFAULT_PAGE_SIZE: parseInt(process.env.API_DEFAULT_PAGE_SIZE || '20', 10),
  
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