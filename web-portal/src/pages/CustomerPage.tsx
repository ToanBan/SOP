import React, { useEffect, useState } from "react";
import getCustomers from "../api/customer/getCustomers";


interface Customer{
	id:string;
	name:string;
	platform:string;
	phone?:string;
	email?:string;
}

const CustomerPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getCustomers();
        setCustomers(response.data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="p-8">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<h3 className="text-2xl font-black tracking-tight">CRM - Khách hàng</h3>
				<div className="flex gap-2">
					<input
						type="text"
						placeholder="Tìm tên, SĐT..."
						className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
					/>
					<button className="bg-white border border-slate-200 p-2 rounded-xl">
						📁 Xuất Excel
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{customers.map((customer, i) => (
					<div
						key={customer.id}
						className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group"
					>
						<div className="flex items-center gap-4 mb-4">
							<div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
								K{i}
							</div>
							<div>
								<h4 className="font-bold">{customer.name}</h4>
								<p className="text-xs text-slate-400">{customer.platform}</p>
							</div>
						</div>
						<div className="space-y-3 py-4 border-y border-slate-50 mb-4">
							<div className="flex justify-between text-sm">
								<span className="text-slate-400">Nguồn:</span>
								<span className="font-bold text-blue-600">{customer.platform}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-slate-400">Tổng chi tiêu:</span>
								<span className="font-bold">15.000.000đ</span>
							</div>
						</div>
						<button className="w-full py-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition">
							Xem chi tiết
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default CustomerPage;
