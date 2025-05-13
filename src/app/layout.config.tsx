import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiteIcon } from '@/components/global-icon';
import { appConfig } from '@/lib/appConfig';

// export function injectGithubLink() : IconItemType[] {
//   return !appConfig.style.showGithub ? [] : [{ 
//     type: 'icon',
//     icon: <icons.Github />,
//     url: appConfig.style.siteGithub,
//     label: 'GitHub',
//     text: 'GitHub',
//     on: 'nav'
//   }]
// }

export function baseOptions(indexUrl: string): BaseLayoutProps {
  return {
    // 导航Header配置
    nav: {
      url: indexUrl || "#",
      title: (
        <>
          <SiteIcon/>
          <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
            {appConfig.style.siteName}
          </span>
        </>
      ),
      // 导航Header, 透明模式选项: none | top | always
      // https://fumadocs.dev/docs/ui/layouts/docs#transparent-mode
      transparentMode: 'none',
    },
    githubUrl: appConfig.style.showGithub ? appConfig.style.siteGithub : undefined,
  };
}

