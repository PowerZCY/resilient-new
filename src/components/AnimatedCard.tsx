import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
}

export default function AnimatedCard({ children }: AnimatedCardProps) {
  return (
    <motion.div
      className="relative group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* 发光边框效果 */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-violet-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xs" />
      
      {/* 波浪动画背景 */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="wave-animation" />
      </div>

      {/* 内容层 */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl p-5 flex flex-col w-full transition-colors duration-200">
        {children}
      </div>
    </motion.div>
  );
}