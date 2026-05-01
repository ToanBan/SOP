import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MoreVertical,
  Search,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";

// --- 1. Interfaces ---
interface Campaign {
  id: string;
  content: string;
  endDate: string;
  images: string[];
  createdAt: string;
  platformCount: number;
  status?: "draft" | "published" | "scheduled";
}

// --- 2. Sub-components ---

// Badge hiển thị trạng thái dựa trên thời gian
const StatusBadge: React.FC<{ endDate: string }> = ({ endDate }) => {
  const isExpired = new Date(endDate) < new Date();

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
        isExpired
          ? "bg-red-50 text-red-500 border border-red-100"
          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
      }`}
    >
      {isExpired ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
      {isExpired ? "Hết hạn" : "Đang chạy"}
    </div>
  );
};

// Card hiển thị từng chiến dịch
const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col h-full">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-5">
        <StatusBadge endDate={campaign.endDate} />
        <button className="text-slate-300 hover:text-indigo-600 transition-colors p-1">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 mb-5">
        <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 font-medium italic">
          "{campaign.content}"
        </p>
      </div>

      {/* Image Gallery Logic */}
      {campaign.images && campaign.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {campaign.images.slice(0, 3).map((img, idx) => (
            <div
              key={idx}
              className="relative h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
            >
              <img
                src={img}
                alt="campaign-media"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {idx === 2 && campaign.images.length > 3 && (
                <div className="absolute inset-0 bg-indigo-900/70 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-black">
                  +{campaign.images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 h-20 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Không có hình ảnh
          </span>
        </div>
      )}

      {/* Footer Section */}
      <div className="pt-5 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Clock size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-black uppercase leading-none">
                Hạn cuối
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="flex -space-x-2">
            {[...Array(campaign.platformCount)].map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold"
              >
                {i === 0 ? "TG" : i === 1 ? "DC" : "FB"}
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn">
          Xem chi tiết
          <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const CampaignPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "CAM-001",
      content: "Ra mắt bộ sưu tập công nghệ mới nhất 2026. Ưu đãi đặc quyền cho thành viên đăng ký sớm trong tuần lễ vàng.",
      endDate: "2026-06-20T23:59:59Z",
      images: [
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
        "https://images.unsplash.com/photo-1504868584819-f8e905b6dc79?w=400"
      ],
      createdAt: "2026-04-01",
      platformCount: 3
    },
    {
      id: "CAM-002",
      content: "Thông báo cập nhật chính sách bảo mật và điều khoản sử dụng mới. Vui lòng kiểm tra email của bạn để biết thêm chi tiết.",
      endDate: "2026-01-15T23:59:59Z",
      images: [],
      createdAt: "2026-04-10",
      platformCount: 1
    },
    {
      id: "CAM-003",
      content: "Flash Sale cuối tuần! Giảm giá cực sâu lên đến 70% cho các dòng tai nghe Bluetooth cao cấp.",
      endDate: "2026-12-10T23:59:59Z",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
      createdAt: "2026-04-25",
      platformCount: 2
    }
  ]);

  const filteredCampaigns = campaigns.filter(c =>
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <LayoutGrid size={24} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Chiến dịch
              </h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">
              Theo dõi và quản lý hiệu suất các chiến dịch Marketing đa kênh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm mã hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-sm w-full md:w-80 shadow-sm"
              />
            </div>
            <button className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={20} />
            </button>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-sm">
              <Plus size={18} /> Tạo mới
            </button>
          </div>
        </div>

       

        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Không tìm thấy kết quả</h3>
            <p className="text-slate-400 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm của bạn xem sao nhé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignPage;