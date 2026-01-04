// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { Search, Bell, Ticket, Plus, ChevronDown, Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes";
// import { useEffect, useState } from "react";

// export function Header() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   // Tránh lỗi hydration
//   // useEffect(() => {
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   //   setMounted(true);
//   // }, []);

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-none bg-white dark:bg-[#1a103c] transition-colors duration-300">
//       <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">

//         {/* === LEFT: LOGO === */}
//         <Link href="/" className="flex items-center gap-2 flex-shrink-0">
//           {/* Giả lập logo EvoTicket */}
//           <div className="relative w-8 h-8 flex items-center justify-center border-2 border-gray-700 dark:border-gray-400 rounded">
//             <div className="w-4 h-4 border border-gray-700 dark:border-gray-400 rotate-45"></div>
//           </div>
//           <div className="flex flex-col">
//             <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 leading-none">
//               Evo<span className="text-gray-500 dark:text-gray-400">Ticket</span>
//             </span>
//             <span className="text-[10px] text-gray-500 uppercase tracking-wider">Event-booking</span>
//           </div>
//         </Link>

//         {/* === CENTER: SEARCH BAR === */}
//         {/* Style đặc biệt: Nền trắng ở cả 2 chế độ (theo ảnh mẫu) */}
//         <div className="hidden md:flex flex-1 max-w-xl mx-4">
//           <div className="w-full flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 ring-purple-500 transition-shadow h-11">
//             <div className="pl-4 text-gray-400">
//               <Search size={20} />
//             </div>
//             <input
//               type="text"
//               placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
//               className="flex-1 px-3 py-2 text-gray-700 outline-none placeholder:text-gray-400"
//             />
//             <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
//             <button className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
//               Tìm kiếm
//             </button>
//           </div>
//         </div>

//         {/* === RIGHT: ACTIONS === */}
//         <div className="flex items-center gap-3 lg:gap-4">

//           {/* Nút Tạo sự kiện (Màu tím đặc trưng) */}
//           <button className="hidden lg:flex items-center gap-2 bg-[#5b4cb5] hover:bg-[#4a3d9e] text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
//             <div className="bg-white/20 p-0.5 rounded">
//                 <Plus size={14} strokeWidth={3} />
//             </div>
//             <span>Tạo sự kiện</span>
//           </button>

//           {/* Nút Vé của tôi */}
//           <button className="hidden lg:flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
//             <Ticket size={18} />
//             <span>Vé của tôi</span>
//           </button>

//           {/* Icon Notification */}
//           <button className="relative p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
//             <Bell size={20} />
//             <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a103c]">
//               99
//             </span>
//           </button>

//           {/* User Profile */}
//           <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 pr-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
//             <div className="w-8 h-8 rounded bg-gradient-to-tr from-pink-500 to-blue-500 overflow-hidden">
//                {/* Thay src bằng ảnh avatar thật của bạn */}
//                <Image 
//                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
//                  alt="User" 
//                  width={32} 
//                  height={32} 
//                />
//             </div>
//             <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
//           </div>

//           {/* === THEME TOGGLE (Tích hợp vào Header) === */}
//           {/* {mounted && (
//           )} */}
//             <button
//               onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//               className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
//               title="Chuyển đổi giao diện"
//             >
//               {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
//             </button>

//         </div>
//       </div>
//     </header>
//   );
// }
"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Ticket, Plus, ChevronDown, Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "../lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "react-toastify";

// Định nghĩa kiểu dữ liệu User
interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  phoneNumber: string;
  roles: string[];
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { locale } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Cần thiết để tránh lỗi Hydration mismatch khi icon Mặt trăng/Mặt trời khác nhau giữa server/client
  useEffect(() => {
    setMounted(true);
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const response = await api.get("/iam-service/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.status === 200) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // Nếu token hết hạn hoặc lỗi, có thể cân nhắc logout tự động
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    toast.info("Đã đăng xuất");
    router.push(`/${locale}/auth/login`);
    setUser(null); // Clear user state
  };

  return (
    <header className="sticky top-0 z-50 w-full border-none bg-main transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* === LEFT: LOGO === */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          {/* Logo Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center border-2 border-primary rounded transition-colors group-hover:border-primary-hover">
            <div className="w-4 h-4 border border-primary rotate-45 group-hover:border-primary-hover transition-colors"></div>
          </div>
          {/* Logo Text */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-txt-primary leading-none">
              Evo<span className="text-primary">Ticket</span>
            </span>
            <span className="text-[10px] text-txt-muted uppercase tracking-wider">Event-booking</span>
          </div>
        </Link>

        {/* === CENTER: SEARCH BAR === */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="w-full flex items-center bg-surface border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all h-11">
            <div className="pl-4 text-txt-muted">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
              className="flex-1 px-3 py-2 bg-transparent text-txt-primary outline-none placeholder:text-txt-muted"
            />
            <div className="h-6 w-px bg-border mx-2"></div>
            <button className="px-6 py-2 text-sm font-medium text-txt-secondary hover:text-primary transition-colors">
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* === RIGHT: ACTIONS === */}
        <div className="flex items-center gap-3 lg:gap-4">

          {/* Nút Tạo sự kiện (Primary Button) */}
          <button className="hidden lg:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <div className="bg-white/20 p-0.5 rounded">
              <Plus size={14} strokeWidth={3} />
            </div>
            <span>Tạo sự kiện</span>
          </button>

          {/* Nút Vé của tôi (Secondary Button) */}
          <button className="hidden lg:flex items-center gap-2 border border-border text-txt-primary px-4 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors">
            <Ticket size={18} className="text-txt-secondary" />
            <span>Vé của tôi</span>
          </button>

          {/* Icon Notification */}
          <button className="relative p-2.5 border border-border rounded-lg text-txt-secondary hover:bg-secondary transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-main">
              99
            </span>
          </button>

          {/* User Profile Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 border border-border rounded-lg p-1 pr-2 hover:bg-secondary cursor-pointer transition-colors outline-none">
                  <div className="w-8 h-8 rounded bg-linear-to-tr from-primary to-accent overflow-hidden relative">
                    <Image
                      src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <ChevronDown size={16} className="text-txt-muted" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Người dùng"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/user/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Fallback hoặc nút Login nếu chưa đăng nhập (tùy nhu cầu, ở đây giữ nguyên placeholder nếu chưa có user data để tránh layout shift quá nhiều, hoặc có thể hiện nút login)
            <div className="flex items-center gap-2 border border-border rounded-lg p-1 pr-2 hover:bg-secondary cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
              <ChevronDown size={16} className="text-txt-muted" />
            </div>
          )}

          {/* === THEME TOGGLE === */}
          {/* Chỉ render icon khi client đã mounted để tránh lỗi hydration */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-2 p-2 rounded-full bg-secondary text-txt-secondary hover:bg-border transition-colors"
            title="Chuyển đổi giao diện"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun size={20} className="text-accent" />
              ) : (
                <Moon size={20} />
              )
            ) : (
              <div className="w-5 h-5" /> // Placeholder khi chưa load xong
            )}
          </button>

        </div>
      </div>
    </header>
  );
}