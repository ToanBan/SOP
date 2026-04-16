import {
	ArrowUpRight,
	BarChart3,
	DollarSign,
	MessageCircle,
	Package,
	TrendingUp,
	Users,
} from "lucide-react";
import React from "react";

const DashboardPage = () => {
	const stats = [
		{
			label: "Tổng doanh thu",
			value: "128.5M",
			growth: "+12%",
			icon: <DollarSign size={20} className="text-indigo-600" />,
			bgColor: "bg-indigo-50",
		},
		{
			label: "Tin nhắn mới",
			value: "1,240",
			growth: "+5%",
			icon: <MessageCircle size={20} className="text-blue-600" />,
			bgColor: "bg-blue-50",
		},
		{
			label: "Đơn hàng mới",
			value: "85",
			growth: "+18%",
			icon: <Package size={20} className="text-amber-600" />,
			bgColor: "bg-amber-50",
		},
		{
			label: "Khách hàng mới",
			value: "42",
			growth: "+2%",
			icon: <Users size={20} className="text-emerald-600" />,
			bgColor: "bg-emerald-50",
		},
	];

	return (
		<div className="p-8 space-y-8 animate-in fade-in duration-500">
			{/* Tiêu đề trang */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-black text-slate-900 tracking-tight">
						Tổng quan hệ thống
					</h2>
					<p className="text-slate-500 text-sm font-medium">
						Cập nhật dữ liệu từ đa kênh theo thời gian thực.
					</p>
				</div>
				<button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition">
					<TrendingUp size={16} />
					Xuất báo cáo
				</button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
					>
						<div className="flex justify-between items-start mb-4">
							<div
								className={`p-3 rounded-2xl ${stat.bgColor} transition-transform group-hover:scale-110`}
							>
								{stat.icon}
							</div>
							<div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
								<ArrowUpRight size={12} />
								{stat.growth}
							</div>
						</div>
						<h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
							{stat.label}
						</h4>
						<p className="text-3xl font-black text-slate-900 mt-1">
							{stat.value}
						</p>
					</div>
				))}
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Biểu đồ doanh thu */}
				<div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[420px]">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-2">
							<BarChart3 className="text-indigo-600" size={20} />
							<h3 className="text-lg font-bold text-slate-900">
								Tăng trưởng doanh thu
							</h3>
						</div>
						<select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
							<option>7 ngày qua</option>
							<option>30 ngày qua</option>
						</select>
					</div>

					<div className="w-full h-64 bg-slate-50 rounded-2xl flex items-end justify-between p-6 gap-3">
						{[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
							<div
								key={i}
								style={{ height: `${h}%` }}
								className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl opacity-90 hover:opacity-100 transition-all cursor-pointer relative group"
							>
								{/* Tooltip khi hover vào cột */}
								<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
									{h} Triệu
								</div>
							</div>
						))}
					</div>
					<div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
						<span>Thứ 2</span>
						<span>Thứ 3</span>
						<span>Thứ 4</span>
						<span>Thứ 5</span>
						<span>Thứ 6</span>
						<span>Thứ 7</span>
						<span>CN</span>
					</div>
				</div>

				{/* Nguồn tin nhắn */}
				<div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
					<h3 className="text-lg font-bold text-slate-900 mb-8">
						Nguồn hội thoại
					</h3>
					<div className="space-y-8">
						{[
							{
								name: "Facebook Messenger",
								value: 65,
								color: "bg-blue-500",
								icon: "🔵",
							},
							{ name: "Zalo OA", value: 25, color: "bg-sky-500", icon: "🔹" },
							{
								name: "Telegram Bot",
								value: 10,
								color: "bg-indigo-400",
								icon: "✈️",
							},
						].map((source) => (
							<div key={source.name} className="group">
								<div className="flex justify-between items-center text-sm mb-3">
									<div className="flex items-center gap-2">
										<span className="text-xs">{source.icon}</span>
										<span className="font-bold text-slate-700">
											{source.name}
										</span>
									</div>
									<span className="text-slate-400 font-black">
										{source.value}%
									</span>
								</div>
								<div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
									<div
										className={`h-full ${source.color} transition-all duration-1000 group-hover:brightness-110`}
										style={{ width: `${source.value}%` }}
									></div>
								</div>
							</div>
						))}
					</div>

					<div className="mt-12 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
						<p className="text-xs text-indigo-700 font-bold leading-relaxed">
							💡 Gợi ý: Tin nhắn từ Facebook đang tăng cao, bạn nên bổ sung thêm
							nhân sự trực kênh này.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardPage;
