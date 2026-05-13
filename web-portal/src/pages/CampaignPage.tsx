import React, { useState, useEffect } from "react";
import {
  Clock,
  MoreVertical,
  Search,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Plus,
  LayoutGrid,
  X,
} from "lucide-react";

import getAllCampaign from "../api/marketing/getAllCampaign";
import getReactions from "../api/marketing/getReactions";
import getComments from "../api/marketing/getComments";
import replyComment from "../api/marketing/replyComment";
interface Campaign {
  id: string;
  content: string;
  scheduledAt: string | null;
  mediaUrls: string[];
}

const getFileType = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension!))
    return "image";
  return "file";
};

const StatusBadge: React.FC<{ scheduledAt: string | null }> = ({
  scheduledAt,
}) => {
  if (!scheduledAt) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
        <Clock size={12} /> Nháp
      </div>
    );
  }
  const isExpired = new Date(scheduledAt) < new Date();
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isExpired ? "bg-red-50 text-red-500 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
    >
      {isExpired ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
      {isExpired ? "Đã chạy" : "Đang chờ"}
    </div>
  );
};

const CampaignCard: React.FC<{
  campaign: Campaign;
  onViewDetail: (c: Campaign) => void;
}> = ({ campaign, onViewDetail }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-5">
        <StatusBadge scheduledAt={campaign.scheduledAt} />
        <button className="text-slate-300 hover:text-indigo-600 transition-colors p-1">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="flex-1 mb-5">
        <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 font-medium italic">
          "{campaign.content || "Không có nội dung"}"
        </p>
      </div>

      <div className="mb-6">
        {campaign.mediaUrls && campaign.mediaUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {campaign.mediaUrls.slice(0, 3).map((url, idx) => (
              <div
                key={idx}
                className="relative h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center"
              >
                {getFileType(url) === "image" ? (
                  <img
                    src={url}
                    alt="media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText size={20} className="text-slate-400" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-20 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Không có media
            </span>
          </div>
        )}
      </div>

      <div className="pt-5 border-t border-slate-100">
        <button
          onClick={() => onViewDetail(campaign)}
          className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          Xem chi tiết <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};

const CampaignDetailModal: React.FC<{
  campaign: Campaign;
  onClose: () => void;
}> = ({ campaign, onClose }) => {
  const [reactions, setReactions] = useState<
    Record<string, { count: number; users: any[] }>
  >({});
  const [comments, setComments] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [sending, setSending] = useState(false);
  const [newComment, setNewComment] = useState("");
  const REACTION_CONFIG: Record<
    string,
    { label: string; icon: string; color: string }
  > = {
    LIKE: { label: "Thích", icon: "👍", color: "bg-blue-50 text-blue-600" },
    LOVE: { label: "Yêu thích", icon: "❤️", color: "bg-red-50 text-red-500" },
    CARE: {
      label: "Thương thương",
      icon: "🥰",
      color: "bg-orange-50 text-orange-400",
    },
    HAHA: { label: "Haha", icon: "😆", color: "bg-yellow-50 text-yellow-500" },
    WOW: { label: "Wow", icon: "😮", color: "bg-yellow-50 text-yellow-600" },
    SAD: { label: "Buồn", icon: "😢", color: "bg-yellow-50 text-yellow-700" },
    ANGRY: {
      label: "Phẫn nộ",
      icon: "😡",
      color: "bg-orange-50 text-orange-600",
    },
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyValue.trim() || sending) return;
    try {
      setSending(true);
      const res = await replyComment(campaign.id, commentId, replyValue);
      if (res.success) {
        setComments((prev) =>
          prev.map((cmt) => {
            if (cmt.id === commentId) {
              return {
                ...cmt,
                replies: [
                  ...(cmt.replies ?? []),
                  {
                    id: `temp_${Date.now()}`,
                    message: replyValue,
                    from: { name: "Bạn", id: "me" },
                    createdTime: new Date().toISOString(),
                  },
                ],
              };
            }
            if (cmt.replies?.some((r: any) => r.id === commentId)) {
              return {
                ...cmt,
                replies: [
                  ...(cmt.replies ?? []),
                  {
                    id: `temp_${Date.now()}`,
                    message: replyValue,
                    from: { name: "Bạn", id: "me" },
                    createdTime: new Date().toISOString(),
                  },
                ],
              };
            }
            return cmt;
          }),
        );
        setTotalComments((prev) => prev + 1);
        setReplyValue("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [reactRes, cmtRes] = await Promise.all([
        getReactions(campaign.id),
        getComments(campaign.id),
      ]);
      if (reactRes.success) setReactions(reactRes.reactions ?? {});
      if (cmtRes.success) {
        setComments(cmtRes.comments ?? []);
        setTotalComments(cmtRes.totalCount ?? 0);
      }
    };
    fetchData();
  }, [campaign.id]);

  const handleSendNewComment = async () => {
    if (!newComment.trim() || sending) return;
    try {
      setSending(true);
      const res = await replyComment(campaign.id, newComment);
      if (res.success) {
        setComments((prev) => [
          ...prev,
          {
            id: `temp_${Date.now()}`,
            message: newComment,
            from: { name: "Bạn", id: "me" },
            createdTime: new Date().toISOString(),
            replies: [],
          },
        ]);
        setTotalComments((prev) => prev + 1);
        setNewComment("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-6xl h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* CỘT TRÁI */}
        <div className="md:w-1/2 p-10 overflow-y-auto border-r border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <FileText size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-tighter text-slate-400">
              Nội dung chiến dịch
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8 italic">
            "{campaign.content}"
          </h2>
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Tệp đính kèm ({campaign.mediaUrls.length})
            </span>
            <div className="grid grid-cols-2 gap-3">
              {campaign.mediaUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="w-full h-44 object-cover rounded-3xl border border-slate-100 shadow-sm"
                  alt="attached"
                />
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:w-1/2 bg-slate-50/50 flex flex-col h-full overflow-hidden">
          {/* Reactions */}
          <div className="p-8 bg-white border-b border-slate-100 flex-shrink-0">
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                const count = reactions[type]?.count ?? 0;
                return (
                  <div
                    key={type}
                    className={`${config.color} p-3 rounded-2xl flex flex-col items-center justify-center shadow-sm cursor-default`}
                  >
                    <span className="text-xl mb-1">{config.icon}</span>
                    <span className="text-xs font-black">{count}</span>
                    <span className="text-[9px] font-bold mt-0.5 opacity-70">
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-8">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
              Luồng thảo luận ({totalComments})
            </h4>

            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="text-3xl mb-2">💬</span>
                <span className="text-xs font-bold">Chưa có bình luận nào</span>
              </div>
            ) : (
              comments.map((cmt) => (
                <div key={cmt.id} className="flex gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm flex-shrink-0">
                    {cmt.from.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-slate-900 text-xs">
                          {cmt.from.name}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">
                          {formatTime(cmt.createdTime)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-snug">
                        {cmt.message}
                      </p>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                        Thích
                      </button>
                      <button
                        onClick={() =>
                          setReplyingTo(replyingTo === cmt.id ? null : cmt.id)
                        }
                        className={`text-[10px] font-black uppercase tracking-wider transition-colors ${replyingTo === cmt.id ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"}`}
                      >
                        {replyingTo === cmt.id ? "Hủy" : "Phản hồi"}
                      </button>
                    </div>

                    {/* Input reply */}
                    {replyingTo === cmt.id && (
                      <div className="mt-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex-1">
                          <input
                            autoFocus
                            type="text"
                            value={replyValue}
                            onChange={(e) => setReplyValue(e.target.value)}
                            placeholder={`Phản hồi ${cmt.from.name}...`}
                            className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSendReply(cmt.id)
                            }
                          />
                        </div>
                        <button
                          onClick={() => handleSendReply(cmt.id)}
                          disabled={sending}
                          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 disabled:opacity-50"
                        >
                          {sending ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus size={14} />
                          )}
                        </button>
                      </div>
                    )}

                    {cmt.replies?.length > 0 && (
                      <div className="mt-3 ml-6 space-y-3 relative">
                        <div className="absolute left-[-16px] top-0 bottom-4 w-[2px] bg-slate-100 rounded-full" />
                        {cmt.replies.map((reply: any) => (
                          <div key={reply.id} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs flex-shrink-0">
                              {reply.from.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-black text-slate-900 text-[11px]">
                                    {reply.from.name}
                                    <span className="ml-2 px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded text-[9px] uppercase">
                                      Phản hồi
                                    </span>
                                  </span>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold">
                                    {formatTime(reply.createdTime)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-snug">
                                  {reply.message}
                                </p>
                              </div>

                              {/* Nút hành động */}
                              <div className="flex items-center gap-4 mt-1 ml-2">
                                <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                                  Thích
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingTo(
                                      replyingTo === reply.id ? null : reply.id,
                                    );
                                    setReplyValue(`@${reply.from.name} `);
                                  }}
                                  className={`text-[10px] font-black uppercase tracking-wider transition-colors ${replyingTo === reply.id ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"}`}
                                >
                                  {replyingTo === reply.id ? "Hủy" : "Phản hồi"}
                                </button>
                              </div>

                              {replyingTo === reply.id && (
                                <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
                                  <div className="flex-1">
                                    <input
                                      autoFocus
                                      type="text"
                                      value={replyValue}
                                      onChange={(e) =>
                                        setReplyValue(e.target.value)
                                      }
                                      placeholder={`Phản hồi ${reply.from.name}...`}
                                      className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleSendReply(cmt.id)
                                      }
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleSendReply(cmt.id)}
                                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Chat */}
          <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập bình luận của bạn..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSendNewComment()}
              />
              <button
                onClick={handleSendNewComment}
                disabled={sending}
                className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await getAllCampaign();
        if (response.success) setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c) =>
    c.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg text-white">
                <LayoutGrid size={24} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Chiến dịch Marketing
              </h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">
              Theo dõi và quản lý hiệu suất nội dung của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 w-80 shadow-sm"
              />
            </div>
            <a
              href="/marketing"
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
              <Plus size={18} /> Tạo mới
            </a>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onViewDetail={setSelectedCampaign}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
};

export default CampaignPage;
