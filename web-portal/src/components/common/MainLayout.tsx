import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Users,
  ShieldCheck,
  User,
  BluetoothConnectedIcon,
  Megaphone,
  Target,
} from "lucide-react";
import type React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useUser } from "../../context/authContext";
import { useEffect, useRef, useState } from "react";
import { useSocketNotification } from "../../hooks/useSocketNotification";
import getNotifications from "../../api/notification/getNotifications";
import readNotification from "../../api/notification/readNotification";
import { useNavigate } from "react-router-dom";
import getUnreadCount from "../../api/notification/getUnreadCount";
interface Notification {
  notificationId: string;
  type: "new_message" | "new_customer";
  data: {
    senderName: string;
    preview: string;
    platform: string;
    conversationId: string;
  };
  receivedAt: Date;
  isRead: boolean;
}

const MainLayout: React.FC = () => {
  const { user, logout } = useUser();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useSocketNotification((notification) => {
    setNotifications((prev) => [
      { ...notification, receivedAt: new Date(), isRead: false },
      ...prev,
    ]);
    setUnreadCount((prev) => prev + 1);
  });

  const fetchNotifications = async (currentPage: number = 1) => {
    setLoading(true);
    const res = await getNotifications(currentPage);
    if (res?.success) {
      if (currentPage === 1) {
        setNotifications(res.data);
      } else {
        setNotifications((prev) => [...prev, ...res.data]);
      }
      if (res.data.length < 5) setHasMore(false);
      else setHasMore(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications(1);
    getUnreadCount().then((res) => {
      if (res?.success) setUnreadCount(res.count);
    });
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const handleOpenNotify = () => {
    setIsNotifyOpen((prev) => !prev);
  };

  const handleRead = async (
    notificationId: string,
    isRead: boolean,
    conversationId: string,
  ) => {
    if (!isRead) {
      await readNotification(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount(prev => prev - 1)
    }
    navigate(`/chat?conversationId=${conversationId}`);
    setIsNotifyOpen(false);
  };

  const rawMenuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      name: "Connections",
      icon: <BluetoothConnectedIcon size={20} />,
      path: "/connections",
      requiredRoles: ["admin"],
    },
    {
      name: "Hội thoại",
      icon: <MessageSquare size={20} />,
      path: "/chat",
      requiredRoles: ["admin", "sales"],
    },
    {
      name: "Quảng bá",
      icon: <Megaphone size={20} />,
      path: "/marketing",
      requiredRoles: ["admin", "marketing"],
    },
    {
      name: "Chiến Dịch",
      icon: <Target size={20} />,
      path: "/campaign",
      requiredRoles: ["admin", "marketing"],
    },
    {
      name: "Khách hàng",
      icon: <Users size={20} />,
      path: "/customers",
      requiredRoles: ["admin", "sales", "marketing"],
    },
    {
      name: "Nhân Viên",
      icon: <User size={20} />,
      path: "/admin/sales",
      requiredRoles: ["admin"],
    },
    {
      name: "Roles",
      icon: <ShieldCheck size={20} />,
      path: "/admin/roles",
      requiredRoles: ["admin"],
    },
  ];

  const menuItems = rawMenuItems.filter((item) => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    const userRoles = user?.user?.roles || [];
    return item.requiredRoles.some((role) => userRoles.includes(role));
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifyRef.current &&
        !notifyRef.current.contains(event.target as Node)
      ) {
        setIsNotifyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <MessageSquare size={22} fill="currentColor" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            SOP <span className="text-indigo-600">Omni</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
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
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut size={20} />
            <span className="text-[15px]">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="relative w-80 hidden lg:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification Dropdown */}
            <div className="relative" ref={notifyRef}>
              <button
                onClick={handleOpenNotify}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isNotifyOpen
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                    : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifyOpen && (
                <div className="absolute right-0 mt-4 w-[380px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="px-5 py-4 bg-gradient-to-r from-white to-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Thông báo
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {notifications.length === 0
                          ? "Không có thông báo mới"
                          : `Bạn có ${notifications.length} thông báo`}
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          setNotifications([]);
                          setPage(1);
                          setHasMore(true);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                      <div className="flex items-center justify-center py-12 text-slate-400">
                        <p className="text-sm font-medium">Đang tải...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Bell size={32} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">Chưa có thông báo</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.notificationId}
                          onClick={() =>
                            handleRead(
                              item.notificationId,
                              item.isRead,
                              item.data.conversationId,
                            )
                          }
                          className={`group px-5 py-4 cursor-pointer border-b border-slate-50 last:border-0 transition-all duration-200 ${
                            !item.isRead
                              ? "bg-indigo-50/60 hover:bg-indigo-100/60"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex gap-4">
                            <div
                              className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform ${
                                item.type === "new_customer"
                                  ? "bg-emerald-500"
                                  : "bg-blue-500"
                              }`}
                            >
                              {item.type === "new_customer" ? (
                                <Users size={18} />
                              ) : (
                                <MessageSquare size={18} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4
                                  className={`text-sm transition-colors ${
                                    !item.isRead
                                      ? "font-extrabold text-indigo-700"
                                      : "font-bold text-slate-800 group-hover:text-indigo-600"
                                  }`}
                                >
                                  {item.type === "new_customer"
                                    ? "Khách hàng mới"
                                    : "Tin nhắn mới"}
                                </h4>
                                <div className="flex items-center gap-1 ml-2">
                                  {!item.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                  )}
                                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                    {formatTime(item.receivedAt)}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={`text-[13px] leading-relaxed line-clamp-2 ${
                                  !item.isRead
                                    ? "text-slate-800 font-medium"
                                    : "text-slate-600"
                                }`}
                              >
                                <span className="font-semibold">
                                  {item.data.senderName}
                                </span>{" "}
                                — {item.data.preview}
                              </p>
                              <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {item.data.platform}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                    {hasMore ? (
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? "Đang tải..." : "Xem thêm"}
                      </button>
                    ) : (
                      <p className="text-center text-[12px] text-slate-400 font-medium py-1">
                        Đã hiển thị tất cả thông báo
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                  {user?.user?.username || "Guest"}
                </p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  {user?.user?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-white shadow-md flex items-center justify-center font-bold text-white transition-transform hover:scale-105">
                {user?.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
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
