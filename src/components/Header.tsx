'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { NavigationMenu } from '@/components/NavigationMenu';
import NicknameFilter from '@/components/NicknameFilter';
import { appConfig } from '@/lib/appConfig';
import Link from 'next/link';
import { OrganizationSwitcher, useAuth } from '@clerk/nextjs';
import ClerkLogoIcon from '@/components/icons/ClerkLogoIcon';
import UserIcon from '@/components/icons/UserIcon';
import TermsPage from '@/app/legal/terms/page';
import PrivacyPage from '@/app/legal/privacy/page';
export function Header() {
  const { isLoaded } = useAuth();

  return (
    <header className="bg-gray-50 dark:bg-gray-950 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-xs flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-x-8">
          {/* 左侧 Logo 和标题 - 添加点击回到首页功能 */}
          <Link href="/" className="flex items-center cursor-pointer group shrink-0">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="shrink-0 group-hover:scale-110 transition-transform h-7 flex"
            >
              <Sparkles className="h-7 w-7 text-blue-600" />
            </motion.div>
            <h1 className="ml-2.5 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 whitespace-nowrap group-hover:from-blue-500 group-hover:to-violet-500 transition-all m-0">
              突破消极偏见♾️
            </h1>  
          </Link>

          {/* 左侧导航菜单 */}
          <div className="hidden md:flex">
            <NavigationMenu items={appConfig.menu} />
          </div>

          {/* 中间标语 */}
          <div className="hidden md:flex flex-1 items-center justify-center mx-2 lg:mx-4 overflow-hidden">
            <p className="text-sm lg:text-lg xl:text-xl font-bold whitespace-nowrap bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-[#509863] to-teal-500 animate-gradient-x truncate">
              每天都有好体验、好事儿、成就 ✔
            </p>
          </div>

          {/* 右侧用户筛选器和组织切换器 */}
          <div className="flex items-center shrink-0">
            <div className="flex items-center gap-x-4">
              <NicknameFilter />
              {isLoaded ? (
                <OrganizationSwitcher
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger:
                        "relative z-10 px-4 py-3 h-10 !rounded-full text-sm font-medium bg-white text-purple-900 border border-gray-200 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition flex items-center justify-between box-border w-40",
                      organizationSwitcherTriggerIcon: "text-purple-900 shrink-0",
                    },
                  }}
                >
                  <OrganizationSwitcher.OrganizationProfilePage
                    labelIcon={<ClerkLogoIcon />}
                    label="服务"
                    url="/legal/terms"
                  >
                    <TermsPage />
                  </OrganizationSwitcher.OrganizationProfilePage>

                  <OrganizationSwitcher.OrganizationProfilePage
                    labelIcon={<UserIcon />}
                    label="隐私"
                    url="/legal/privacy"
                  >
                    <PrivacyPage />
                  </OrganizationSwitcher.OrganizationProfilePage>
                </OrganizationSwitcher>
              ) : (
                <div className="w-40 min-h-[40px] rounded-full bg-gray-200 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}