'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      className="relative p-3 rounded-xl glass-effect border border-gray-200/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all duration-300 group cursor-pointer"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        {theme === 'light' ? (
          <Moon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        ) : (
          <Sun className="h-5 w-5 group-hover:rotate-45 transition-transform" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
    </button>
  );
}