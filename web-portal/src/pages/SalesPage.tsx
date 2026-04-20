import React, { useState } from "react";
import {
  Plus,
  Search,
  ShoppingCart,
  X,
  Mail,
  FileText,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import Swal from "sweetalert2";

interface SaleItem {
  id: string;
  email: string;
  description: string;
  createdAt: string;
}

const SalesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State cho Form
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  // Dữ liệu mẫu (Bạn có thể thay thế bằng dữ liệu từ API)
  const [sales, setSales] = useState<SaleItem[]>([
    { id: "1", email: "customer@example.com", description: "Hợp đồng phần mềm POS", createdAt: "2024-03-20" },
  ]);

  const handleAddSales = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Thông tin sales đã được thêm mới.',
      timer: 1500,
      showConfirmButton: false,
    });

    // Reset và đóng modal
    setEmail("");
    setDescription("");
    setIsModalOpen(false);
  };

  const filteredSales = sales.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                <ShoppingCart className="text-white" size={28} />
              </div>
              Quản lý Bán hàng (Sales)
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Theo dõi và thêm mới các thông tin giao dịch bán hàng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Tìm theo email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 w-full md:w-80 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={20} /> Add Sales
            </button>
          </div>
        </header>

        {/* Sales Table Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest">Khách hàng (Email)</th>
                  <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest">Mô tả chi tiết</th>
                  <th className="px-8 py-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                             <Mail size={18} />
                           </div>
                           <span className="font-bold text-slate-900">{sale.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-500 font-medium">
                        {sale.description}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-500 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-slate-400 font-medium">
                      Chưa có dữ liệu bán hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Sales */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-50 p-8">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Plus size={20} />
                  </div>
                  Thêm Sales Mới
                </h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">Nhập thông tin giao dịch vào hệ thống</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSales}>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email khách hàng</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Mô tả giao dịch</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea
                      required
                      rows={4}
                      placeholder="Nhập chi tiết nội dung bán hàng..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 border-t border-slate-50 bg-slate-50/30 p-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl bg-white border border-slate-200 py-4 font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;