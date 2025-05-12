import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { type LinkItemType } from 'fumadocs-ui/layouts/docs';
import { SiteIcon } from '@/components/global-icon';
import NicknameFilter from '@/components/NicknameFilter';

// 首页普通菜单
export function homeNavLinks(): LinkItemType[] {
  return [
    {
      type: 'custom',
      secondary: false,
      children: <NicknameFilter />
    }
  ];
}

// 层级特殊菜单
export function levelNavLinks(): LinkItemType[] {
  return [
  ]
}

export function baseOptions(): BaseLayoutProps {
  return {
    // 导航Header配置
    nav: {
      url: "/",
      title: (
        <>
          <SiteIcon/>
          <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
            突破消极偏见
          </span>
        </>
      ),
      // 导航Header, 透明模式选项: none | top | always
      // https://fumadocs.dev/docs/ui/layouts/docs#transparent-mode
      transparentMode: 'none',
    },
    // 导航Header, Github链接
    githubUrl: "https://github.com/PowerZCY/resilient-new",
  };
}