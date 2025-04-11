import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from '@/lib/appConfig';

interface NavigationMenuProps {
  items: MenuItem[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  const pathname = usePathname();

  return (
    <nav className="relative flex">
      <div className="relative rounded-full p-[1px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-40"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-full px-4 py-2 flex items-center">
          {items.map((item) => {
            // 仍然保留isActive用于文字颜色变化
            const isActive = pathname === item.href || 
              (item.href === '/' && pathname === '/') || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link key={item.key} href={item.href} className="outline-none mx-1">
                <div className="flex items-center justify-center">
                  {/* 始终显示左侧小圆点，不再依赖isActive */}
                  <span className="w-2 h-2 rounded-full mr-2 bg-purple-500" />
                  <span className={`text-base font-medium ${isActive ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {item.key}
                  </span>
                  {/* 始终显示右侧小圆点，不再依赖isActive */}
                  <span className="w-2 h-2 rounded-full ml-2 bg-pink-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}