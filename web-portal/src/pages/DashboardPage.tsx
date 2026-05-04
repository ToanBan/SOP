import {
  ArrowUpRight,
  MessageCircle,
  Users,
  UserPlus,
  Send,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import getStatis from "../api/integration/getStatis";
import { useEffect, useState } from "react";

// --- Interfaces ---
interface PlatformProps {
  platform: string;
  total: number;
}

interface CustomerProps {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  lastSeenAt: string;
}

interface DashboardData {
  countMessage: number;
  countCustomer: number;
  countStaff: number;
  platformStats: PlatformProps[];
  customersDb: CustomerProps[];
}

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const result = await getStatis();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl rotate-45"></div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Tính toán phần trăm cho Platform Stats
  const totalPlatformMessages = data?.platformStats.reduce((acc, curr) => acc + curr.total, 0) || 1;
  
  const statsConfig = [
    {
      label: "Tổng tin nhắn",
      value: data?.countMessage.toLocaleString() || "0",
      growth: "+12%",
      icon: <MessageCircle size={22} />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/50",
    },
    {
      label: "Khách hàng",
      value: data?.countCustomer.toLocaleString() || "0",
      growth: "+5%",
      icon: <UserPlus size={22} />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/50",
    },
    {
      label: "Nhân viên",
      value: data?.countStaff.toLocaleString() || "0",
      growth: "Ổn định",
      icon: <Users size={22} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50/50",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <LayoutDashboard size={18} />
            </div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Hệ thống quản trị</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Tổng quan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">thống kê</span>
          </h2>
        </div>
        <button className="group flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95">
          <TrendingUp size={18} className="group-hover:rotate-12 transition-transform" />
          Xuất báo cáo JSON
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statsConfig.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden bg-white p-8 rounded-[35px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-white hover:border-indigo-100 transition-all group"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl">
                  <ArrowUpRight size={12} />
                  {stat.growth}
                </div>
              </div>
              <h4 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-1">
                {stat.label}
              </h4>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                {stat.value}
              </p>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Customers List */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[45px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)] border border-white">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Khách hàng mới nhất</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Database Sync</p>
              </div>
            </div>
            <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <MoreHorizontal size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="grid gap-3">
            {data?.customersDb.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-5 rounded-[28px] hover:bg-indigo-50/30 transition-all border border-transparent hover:border-indigo-100/50 group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 text-xl border-2 border-white shadow-sm group-hover:from-indigo-500 group-hover:to-violet-600 group-hover:text-white transition-all duration-500">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {customer.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-bold tracking-tight">
                      {customer.email || customer.phone || "Chưa cập nhật thông tin"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mb-1">Hoạt động</p>
                    <p className="text-xs font-bold text-slate-600">
                      {new Date(customer.lastSeenAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <button className="w-11 h-11 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg transition-all shadow-sm">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-5 rounded-[25px] border-2 border-dashed border-slate-100 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
            Xem tất cả {data?.countCustomer} khách hàng
          </button>
        </div>

        {/* Platform Distribution */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[45px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)] border border-white flex-1">
            <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Nguồn dữ liệu</h3>
            
            <div className="space-y-12">
              {data?.platformStats.map((source) => {
                const isTelegram = source.platform.toLowerCase() === "telegram";
                const percentage = Math.round((source.total / totalPlatformMessages) * 100);
                
                return (
                  <div key={source.platform} className="group">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12 ${
                            isTelegram ? "bg-[#24A1DE] shadow-blue-100" : "bg-[#5865F2] shadow-indigo-100"
                          }`}
                        >
                          {isTelegram ? (
                            <Send size={20} className="text-white" />
                          ) : (
                            <MessageSquare size={20} className="text-white" />
                          )}
                        </div>
                        <div>
                          <span className="block font-black text-slate-800 text-base capitalize">
                            {source.platform}
                          </span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {source.total} tin nhắn
                          </span>
                        </div>
                      </div>
                      <span className="text-slate-900 font-black text-2xl tracking-tighter">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-50">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 group-hover:brightness-110 ${
                          isTelegram ? "bg-[#24A1DE]" : "bg-[#5865F2]"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">AI Insight</p>
              </div>
              <p className="text-lg font-bold leading-tight italic">
                "Kênh <span className="text-emerald-300">Telegram</span> đang có tỷ lệ tương tác cao nhất ({Math.round(((data?.platformStats.find(p => p.platform === 'telegram')?.total || 0) / totalPlatformMessages) * 100)}%). Hãy tối ưu hóa quy trình CSKH tại đây."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;