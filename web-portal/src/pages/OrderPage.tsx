import {
	Circle,
	Download,
	Eye,
	Filter,
	MoreVertical,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import React from "react";

const OrderPage = () => {
	const orders = [
		{
			id: "ORD-7721",
			customer: "Nguyễn Văn A",
			product: "Khóa học NestJS",
			total: "1.200.000đ",
			status: "Hoàn tất",
			platform: "Messenger",
		},
		{
			id: "ORD-7722",
			customer: "Trần Thị B",
			product: "Khóa học React NextJS",
			total: "2.500.000đ",
			status: "Đang xử lý",
			platform: "Zalo",
		},
		{
			id: "ORD-7723",
			customer: "Lê Toàn Bân",
			product: "Combo Microservices",
			total: "4.800.000đ",
			status: "Đã hủy",
			platform: "Telegram",
		},
		{
			id: "ORD-7724",
			customer: "Phạm Minh C",
			product: "Khóa học Spring Boot",
			total: "1.800.000đ",
			status: "Hoàn tất",
			platform: "Messenger",
		},
	];

	return (
		<div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div>
					<h3 className="text-2xl font-black text-slate-900 tracking-tight">
						Quản lý đơn hàng
					</h3>
					<p className="text-slate-500 text-sm font-medium">
						Theo dõi và xử lý đơn hàng từ đa nền tảng.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
						<Download size={18} />
						Xuất file
					</button>
					<button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
						<Plus size={18} />
						Tạo đơn mới
					</button>
				</div>
			</div>

			{/* Filters & Search */}
			<div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between">
				<div className="relative flex-1 max-w-md">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						size={18}
					/>
					<input
						type="text"
						placeholder="Tìm theo mã đơn, khách hàng..."
						className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
					/>
				</div>
				<div className="flex items-center gap-2">
					<button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition">
						<Filter size={16} />
						Bộ lọc
					</button>
				</div>
			</div>

			{/* Table Section */}
			<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-slate-50/50 border-b border-slate-100">
							<tr>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
									Mã đơn
								</th>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
									Khách hàng
								</th>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
									Nguồn
								</th>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
									Sản phẩm
								</th>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
									Tổng tiền
								</th>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
									Trạng thái
								</th>
								<th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
									Hành động
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-50">
							{orders.map((order) => (
								<tr
									key={order.id}
									className="hover:bg-slate-50/50 transition-colors group"
								>
									<td className="px-6 py-4">
										<span className="font-bold text-indigo-600 text-sm">
											{order.id}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-col">
											<span className="font-bold text-slate-900 text-sm">
												{order.customer}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<span
											className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
												order.platform === "Messenger"
													? "bg-blue-50 text-blue-600"
													: order.platform === "Zalo"
														? "bg-sky-50 text-sky-600"
														: "bg-indigo-50 text-indigo-600"
											}`}
										>
											{order.platform}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-slate-600 text-sm font-medium">
											{order.product}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="font-black text-slate-900 text-sm">
											{order.total}
										</span>
									</td>
									<td className="px-6 py-4">
										<div
											className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
												order.status === "Hoàn tất"
													? "bg-emerald-50 text-emerald-600"
													: order.status === "Đang xử lý"
														? "bg-amber-50 text-amber-600"
														: "bg-rose-50 text-rose-600"
											}`}
										>
											<Circle size={8} fill="currentColor" />
											{order.status}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center justify-center gap-2">
											<button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
												<Eye size={18} />
											</button>
											<button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
												<Trash2 size={18} />
											</button>
											<button className="p-2 text-slate-300 hover:text-slate-600 transition-all md:hidden lg:block">
												<MoreVertical size={18} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination Placeholder */}
				<div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center text-sm font-medium text-slate-500">
					<span>Hiển thị 1 - 4 của 24 đơn hàng</span>
					<div className="flex gap-2">
						<button
							className="px-4 py-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
							disabled
						>
							Trước
						</button>
						<button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
							Sau
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderPage;
