import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  FileUp,
  X,
  Type,
  LayoutGrid,
  Globe,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Search,
  Clock,
} from "lucide-react";

import getConversations from "../api/marketing/getConversations";
import createCampaign from "../api/marketing/createCampaign";
import Swal from "sweetalert2";

interface DistributionProps {
  id: string;
  title: string;
  externalConversationId: string;
  conversationType: string;
  platform: string;
  name:string
}

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "telegram":
      return <Send size={18} />;
    case "discord":
      return <LayoutGrid size={18} />;
    case "facebook":
      return <Globe size={18} />;
    default:
      return <Layers size={18} />;
  }
};

const DistributionCard: React.FC<{
  item: DistributionProps;
  isSelected: boolean;
  onToggle: (id: string) => void;
}> = ({ item, isSelected, onToggle }) => (
  <div
    onClick={() => onToggle(item.id)}
    className={`group cursor-pointer p-4 rounded-[1.5rem] border-2 transition-all duration-300 ${
      isSelected
        ? "bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-100"
        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div className="flex items-start gap-4">
      {/* Icon Platform */}
      <div
        className={`p-3 rounded-2xl transition-colors shrink-0 ${
          isSelected
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-white"
        }`}
      >
        {getPlatformIcon(item.platform)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title */}
        <h4
          className={`font-bold text-sm truncate mb-0.5 ${
            isSelected ? "text-indigo-900" : "text-slate-700"
          }`}
        >
          {item.name || "Kênh không tên"}
        </h4>

        {/* Thông tin chi tiết: Platform | ID Phòng */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isSelected
                  ? "bg-indigo-200 text-indigo-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {item.platform}
            </span>
            <span className="text-[10px] text-slate-400 font-medium italic">
              Type: {item.conversationType}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Search size={10} />
            <p className="text-[10px] font-mono">
              ID: {item.externalConversationId}
            </p>
          </div>
        </div>
      </div>

      {/* Checkbox status */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
          isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-200"
        }`}
      >
        {isSelected && <CheckCircle2 size={12} className="text-white" />}
      </div>
    </div>
  </div>
);
const MarketingPage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [distribution, setDistribution] = useState<DistributionProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (id: string): void => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const uploadedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...uploadedFiles]);
    }
  };

  const removeFile = (index: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchDistribution = async () => {
    const result = await getConversations();
    if (result.success) {
      setDistribution(result.data);
    } else {
      setDistribution([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content) {
      Swal.fire({
        title: "Thiếu nội dung!",
        text: "Vui lòng nhập nội dung trước khi xuất bản.",
        icon: "warning",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      Swal.fire({
        title: "Chưa chọn kênh!",
        text: "Vui lòng chọn ít nhất một kênh phân phối.",
        icon: "info",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    Swal.fire({
      title: "Đang xuất bản...",
      text: "Vui lòng chờ trong giây lát",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const result = await createCampaign(
        content,
        selectedPlatforms,
        endDate,
        files,
      );

      if (result && result.success) {
        Swal.fire({
          title: "Thành công!",
          text: "Chiến dịch của bạn đã được gửi đi.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        setContent("");
        setFiles([]);
        setSelectedPlatforms([]);
        setEndDate("");
      } else {
        throw new Error(result?.message || "Có lỗi xảy ra khi tạo chiến dịch");
      }
    } catch (error: any) {
      Swal.fire({
        title: "Thất bại!",
        text: error.message || "Không thể kết nối đến máy chủ.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  useEffect(() => {
    fetchDistribution();
  }, []);

  const filteredDistribution = distribution.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  console.log(distribution);
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                <Sparkles size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Chiến dịch Marketing
              </h1>
            </div>
            <p className="text-slate-500 font-medium">
              Sáng tạo nội dung và phủ sóng đa kênh chỉ với một click.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm">
              <Calendar size={18} /> Lên lịch
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedPlatforms.length === 0 || !content}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-indigo-100"
            >
              <Send size={18} /> Xuất bản ngay
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Editor (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden focus-within:border-indigo-400 transition-colors">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    title="Định dạng text"
                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                  >
                    <Type size={20} />
                  </button>
                  <button
                    title="Thêm ảnh"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>

                {/* Date Input Field */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                  <Clock size={16} className="text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    Kết thúc:
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs font-bold text-slate-600 outline-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn muốn chia sẻ điều gì hôm nay?"
                className="w-full h-80 p-8 outline-none text-lg text-slate-700 placeholder:text-slate-300 resize-none"
              />

              {files.length > 0 && (
                <div className="p-6 flex flex-wrap gap-4 bg-slate-50/30 border-t border-slate-100">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative group w-28 h-28 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-red-200 transition-colors"
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400 p-3 text-center break-all leading-tight">
                        {file.name}
                      </div>
                      {file.type.startsWith("image/") && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="absolute inset-0 w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                        />
                      )}
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-red-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center justify-between p-6 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <FileUp size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Tải lên tài liệu</p>
                  <p className="text-xs text-slate-400">
                    Hỗ trợ hình ảnh, PDF, Video (Max 20MB)
                  </p>
                </div>
              </div>
              <span className="text-indigo-600 font-bold text-sm">
                Chọn file
              </span>
            </div>
          </div>

          {/* Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col h-[680px]">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Phân phối
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">
                      Danh sách kênh mục tiêu
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {distribution.length} Kênh
                  </span>
                </div>

                {/* Search Bar cho Kênh */}
                <div className="relative group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm kênh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-200 transition-all"
                  />
                </div>
              </div>

              {/* Danh sách cuộn */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {filteredDistribution.length > 0 ? (
                  filteredDistribution.map((item) => (
                    <DistributionCard
                      key={item.id}
                      item={item}
                      isSelected={selectedPlatforms.includes(item.id)}
                      onToggle={togglePlatform}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <Layers className="text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {searchTerm
                        ? "Không tìm thấy kênh nào khớp với từ khóa"
                        : "Chưa có kênh nào được kết nối"}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.1em]">
                    Lựa chọn hiện tại
                  </span>
                  <span className="text-indigo-600 font-black text-sm">
                    {selectedPlatforms.length} / {distribution.length}
                  </span>
                </div>

                <button className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group">
                  <Plus
                    size={16}
                    className="group-hover:rotate-90 transition-transform"
                  />
                  Thêm kết nối mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
