/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useState } from 'react';
import LogoutDialog from './LogoutDialog';

export default function UserMenu() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  // 打开登出对话框
  const handleUserIconClick = () => {
    setIsLogoutDialogOpen(true);
  };
  
  // 关闭登出对话框
  const handleCloseLogoutDialog = () => {
    setIsLogoutDialogOpen(false);
  };
  
  return (
    <>
      {/* 用户图标按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUserIconClick}
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="用户菜单"
      >
        <User className="h-5 w-5 text-indigo-600" />
      </motion.button>
      
      {/* 登出确认对话框 */}
      <LogoutDialog 
        isOpen={isLogoutDialogOpen} 
        onClose={handleCloseLogoutDialog} 
      />
    </>
  );
} 