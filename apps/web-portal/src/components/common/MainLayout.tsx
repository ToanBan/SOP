import {
	Bell,
	ChevronRight,
	LayoutDashboard,
	LogOut,
	MessageSquare,
	Search,
	Settings,
	ShoppingBag,
	Users,
} from "lucide-react"; // Import các icon cần dùng
import type React from "react";
import { NavLink, Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
	const menuItems = [
		{
			name: "Dashboard",
			icon: <LayoutDashboard size={20} />,
			path: "/admin/dashboard",
		},
		{
			name: "Hội thoại",
			icon: <MessageSquare size={20} />,
			path: "/admin/chat",
		},
		{
			name: "Đơn hàng",
			icon: <ShoppingBag size={20} />,
			path: "/admin/orders",
		},
		{ name: "Khách hàng", icon: <Users size={20} />, path: "/admin/customers" },
	];

	return (
		<div className="flex h-screen bg-slate-50 font-sans text-slate-900">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
				<div className="p-6 flex items-center gap-3">
					<div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
						<MessageSquare
							size={22}
							fill="currentColor"
							className="text-white"
						/>
					</div>
					<span className="text-xl font-black tracking-tighter uppercase">
						SOP <span className="text-indigo-600">Omni</span>
					</span>
				</div>

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
				</nav>

				{/* Bottom Section: User Profile */}
				<div className="p-4 mt-auto border-t border-slate-100">
					<div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl border border-slate-100">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-white shadow-sm flex items-center justify-center font-bold text-white">
								B
							</div>
							<div className="overflow-hidden text-sm">
								<p className="font-bold text-slate-900 truncate">Lê Toàn Bân</p>
								<p className="text-[11px] text-slate-500 font-medium">
									Quản trị viên
								</p>
							</div>
						</div>
						<button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
							<LogOut size={18} />
						</button>
					</div>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
					<div className="relative w-96 hidden md:block">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Tìm kiếm nhanh..."
							className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
						/>
					</div>

					<div className="flex items-center gap-5">
						<button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group">
							<Bell size={20} />
							<span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
						</button>

						<div className="h-6 w-[1px] bg-slate-200"></div>

						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
							<span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
								LETOANBAN
							</span>
						</div>
					</div>
				</header>

				{/* Nội dung trang con */}
				<div className="flex-1 overflow-auto bg-[#F8FAFC]">
					<Outlet />
				</div>
			</main>
		</div>
	);
};

export default MainLayout;
