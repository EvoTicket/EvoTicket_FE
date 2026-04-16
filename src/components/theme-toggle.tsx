"use client";

import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useLayoutEffect này chỉ chạy ở client, giúp tránh lỗi Hydration của Next.js
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  // Nếu chưa mount xong (đang ở server), không hiển thị gì cả để tránh lỗi UI
  if (!mounted) return null;

  return (
    <div className="flex gap-2 p-4">
      {/* Nút Light Mode */}
      <button
        onClick={() => setTheme("light")}
        className={`px-4 py-2 rounded-md border transition-colors ${theme === "light"
            ? "bg-blue-500text-button-primary-text-default border-blue-500"
            : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
      >
        Light
      </button>

      {/* Nút Dark Mode */}
      <button
        onClick={() => setTheme("dark")}
        className={`px-4 py-2 rounded-md border transition-colors ${theme === "dark"
            ? "bg-blue-500text-button-primary-text-default border-blue-500"
            : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
      >
        Dark
      </button>

      {/* Nút System (Theo cài đặt máy) */}
      <button
        onClick={() => setTheme("system")}
        className={`px-4 py-2 rounded-md border transition-colors ${theme === "system"
            ? "bg-blue-500text-button-primary-text-default border-blue-500"
            : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
      >
        System
      </button>
    </div>
  );
}