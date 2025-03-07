/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, rememberMe }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed, please check your username and password');
      }
      
      // 获取用户信息
      const userData = await response.json();
      
      // 登录成功，重定向到首页，并添加nickname参数
      router.push(`/?nickname=${encodeURIComponent(userData.user.nickname)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Logo和标题区域 */}
          <div className="flex flex-col items-center justify-center p-6 pb-2">
            <div className="w-16 h-16 relative mb-4">
              <Image 
                src="/logo.svg" 
                alt="WindRun·Huaiin Logo" 
                fill 
                priority
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">WindRun·Huaiin</h1>
            <p className="text-gray-500 mt-1">Record positive moments in life</p>
          </div>
          
          {/* 表单区域 */}
          <div className="p-6 pt-2">
            <form onSubmit={handleSubmit}>
              {/* 错误提示 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md"
                >
                  {error}
                </motion.div>
              )}
              
              {/* 用户名输入框 */}
              <div className="mb-4">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1 block">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter your username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              
              {/* 密码输入框 */}
              <div className="mb-6">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              
              {/* 记住我选项 */}
              <div className="flex items-center mb-6">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setRememberMe(checked === true)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </Label>
              </div>
              
              {/* 登录按钮 */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                  "text-white font-medium rounded-md transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                  "flex items-center justify-center"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </div>
        </div>
        
        {/* 页脚信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Copyright &copy; {new Date().getFullYear()} 巽川·怀因 All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
} 