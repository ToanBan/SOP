import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  ShoppingBag,
  Users,
  ShieldCheck,
  User
} from "lucide-react";
import type React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useUser } from "../../context/authContext";

const MainLayout: React.FC = () => {
  const { user, logout } = useUser();
  console.log("User in MainLayout:", user);
  const rawMenuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      name: "Hội thoại",
      icon: <MessageSquare size={20} />,
      path: "/chat",
    },
    {
      name: "Đơn hàng",
      icon: <ShoppingBag size={20} />,
      path: "/orders",
    },
    {
      name: "Khách hàng",
      icon: <Users size={20} />,
      path: "/customers",
    },
    {
      name: "Sales",
      icon: <User size={20} />,
      path: "/admin/sales",
      adminOnly: true,
    },

    {
      name: "Roles",
      icon: <ShieldCheck size={20} />,
      path: "/admin/roles",
      adminOnly: true,
    },
  ];

  const menuItems = rawMenuItems.filter((item) => {
    if (item.adminOnly) {
      return user?.user?.roleName === "admin";
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <MessageSquare size={22} fill="currentColor" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            SOP <span className="text-indigo-600">Omni</span>
          </span>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-[15px]">{item.name}</span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </NavLink>
          ))}

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-rose-500 transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span className="text-[15px]">Đăng xuất</span>
            </div>
          </button>
        </nav>

        {/* User */}
        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-white shadow-sm flex items-center justify-center font-bold text-white">
                {user?.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden text-sm">
                <p className="font-bold text-slate-900 truncate">
                  {user?.user?.username || "User"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {user?.user?.role === "admin"
                    ? "Quản trị viên"
                    : "Nhân viên"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-96 hidden md:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 uppercase">
                {user?.user?.username}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;