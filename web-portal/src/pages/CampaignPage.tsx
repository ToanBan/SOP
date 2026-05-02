import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MoreVertical,
  Search,
  FileText,
  Video,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  LayoutGrid,
  Download,
  FileArchive,
  Eye
} from "lucide-react";

import getAllCampaign from "../api/marketing/getAllCampaign";

interface Campaign {
  id: string;
  content: string;
  scheduledAt: string | null;
  mediaUrls: string[];
}

const getFileType = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension!)) return "image";
  if (['mp4', 'webm', 'ogg', 'mov'].includes(extension!)) return "video";
  if (['pdf'].includes(extension!)) return "pdf";
  if (['xlsx', 'xls', 'csv'].includes(extension!)) return "excel";
  if (['doc', 'docx'].includes(extension!)) return "word";
  return "file";
};

const handleDownload = (url: string) => {
  window.open(url, "_blank");
};

const StatusBadge: React.FC<{ scheduledAt: string | null }> = ({ scheduledAt }) => {
  if (!scheduledAt) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
        <Clock size={12} /> Nháp / Gửi ngay
      </div>
    );
  }

  const isExpired = new Date(scheduledAt) < new Date();
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
        isExpired
          ? "bg-red-50 text-red-500 border border-red-100"
          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
      }`}
    >
      {isExpired ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
      {isExpired ? "Đã chạy" : "Đang chờ"}
    </div>
  );
};

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col h-full">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-5">
        <StatusBadge scheduledAt={campaign.scheduledAt} />
        <button className="text-slate-300 hover:text-indigo-600 transition-colors p-1">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 mb-5">
        <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 font-medium italic">
          "{campaign.content || "Không có nội dung"}"
        </p>
      </div>

      {/* Media Gallery - Xử lý click để download/xem */}
      <div className="mb-6">
        {campaign.mediaUrls && campaign.mediaUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {campaign.mediaUrls.slice(0, 3).map((url, idx) => {
              const type = getFileType(url);
              return (
                <div
                  key={idx}
                  onClick={() => handleDownload(url)}
                  className="relative h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center cursor-pointer group/media transition-all hover:ring-2 hover:ring-indigo-400"
                  title="Bấm để xem hoặc tải xuống"
                >
                  {type === "image" ? (
                    <img
                      src={url}
                      alt="campaign-media"
                      className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover/media:text-indigo-500 transition-colors">
                      {type === "video" && <Video size={20} />}
                      {(type === "word" || type === "pdf") && <FileText size={20} />}
                      {type === "excel" && <FileArchive size={20} />}
                      {type === "file" && <Download size={20} />}
                      <span className="text-[8px] font-bold uppercase">{url.split('.').pop()}</span>
                    </div>
                  )}

                  {/* Overlay khi hover */}
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye size={16} className="text-indigo-600" />
                  </div>
                  
                  {idx === 2 && campaign.mediaUrls.length > 3 && (
                    <div className="absolute inset-0 bg-indigo-900/70 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-black">
                      +{campaign.mediaUrls.length - 3}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-20 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Không có đính kèm
            </span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="pt-5 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Calendar size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-black uppercase leading-none">
                Lịch trình
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {campaign.scheduledAt 
                  ? new Date(campaign.scheduledAt).toLocaleDateString("vi-VN") 
                  : "Chưa lên lịch"}
              </span>
            </div>
          </div>

          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">FB</div>
            <div className="w-7 h-7 rounded-full border-2 border-white bg-sky-500 flex items-center justify-center text-[8px] text-white font-bold">TG</div>
          </div>
        </div>

        <button 
          onClick={() => console.log("Detail for:", campaign.id)}
          className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
        >
          Xem chi tiết
          <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const CampaignPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await getAllCampaign();
        if (response.success) {
          setCampaigns(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách chiến dịch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c =>
    c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
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
              Quản lý và theo dõi hiệu suất nội dung đa nền tảng.
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

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
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
            <h3 className="text-xl font-bold text-slate-700">Không tìm thấy chiến dịch</h3>
            <p className="text-slate-400 text-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc tạo chiến dịch mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignPage;