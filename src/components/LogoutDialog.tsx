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
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutDialog({ isOpen, onClose }: LogoutDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to login page after successful logout
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Close dialog even if there's an error
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">登出</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dialog content */}
            <div className="p-6">
              <div className="flex items-center text-gray-700 mb-4">
                <LogOut className="mr-3 text-indigo-500" size={24} />
                <p>确认登出系统?</p>
              </div>

              {/* Button area */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  取消
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </>
                  ) : (
                    '确认'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 