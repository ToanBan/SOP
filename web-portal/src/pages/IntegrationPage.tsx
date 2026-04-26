import { useEffect, useState } from "react";
import {
  Activity,
  ExternalLink,
  MoreVertical,
  Plus,
  Settings,
  X,
  LayoutGrid,
  Store,
  ChevronRight,
  Copy,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  Loader2
} from "lucide-react";
import getIntegrations from "../api/integration/getIntegrations";
import getChannelAccountByIntegration from "../api/integration/getChannelAccountByIntegration";

// --- Interfaces ---
interface StoreProps {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface ChannelAccountProps {
  id: string;
  name: string;
  platform: string;
  status: string;
  updatedAt: string;
  botId?: string;
  botName?: string;
  webhook?: string;
}

const IntegrationPage = () => {
  const [stores, setStores] = useState<StoreProps[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [activeShop, setActiveShop] = useState<StoreProps | null>(null);
  const [channels, setChannels] = useState<ChannelAccountProps[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const results = await getIntegrations();
      if (results.success) setStores(results.data);
    } catch (error) {
      console.error("Fetch stores failed", error);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openChannelsModal = async (store: StoreProps) => {
    setActiveShop(store);
    setLoadingChannels(true);
    setIsChannelModalOpen(true);
    try {
      const result = await getChannelAccountByIntegration(store.id);
      if (result.success) {
        setChannels(result.data);
      } else {
        setChannels([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <Activity size={12} /> Dashboard quản trị
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quản lý Cửa hàng</h1>
            <p className="text-slate-500 font-medium mt-1 text-lg">Kết nối và giám sát các kênh thông báo tích hợp.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-[15px] hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95 group"
          >
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
            Tạo Shop mới
          </button>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin Shop</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Shop ID</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingStores ? (
                   <tr>
                     <td colSpan={4} className="py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
                        <p className="text-slate-400 font-bold text-xs uppercase">Đang tải danh sách...</p>
                     </td>
                   </tr>
                ) : stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <Store size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg leading-tight">{store.name}</p>
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded-full ${store.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${store.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {store.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        {store.id}
                      </code>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500 italic">{store.createdAt}</td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => openChannelsModal(store)}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-indigo-600 transition shadow-md active:scale-95"
                      >
                        XEM KÊNH <ChevronRight size={14} strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setIsChannelModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">{activeShop?.name}</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Các kênh tích hợp đang chạy</p>
                </div>
              </div>
              <button onClick={() => setIsChannelModalOpen(false)} className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-100 hover:scale-110 transition-all text-slate-400">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto grow">
              {loadingChannels ? (
                <div className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
                  <p className="text-slate-400 font-bold text-sm uppercase">Đang lấy dữ liệu tài khoản...</p>
                </div>
              ) : channels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {channels.map((channel) => (
                    <div key={channel.id} className="group border border-slate-100 bg-white p-6 rounded-[32px] hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-100 transition-all duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3 text-lg font-black text-slate-800 capitalize">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${channel.platform === 'telegram' ? 'bg-sky-50 text-sky-500' : 'bg-indigo-50 text-indigo-500'}`}>
                              <MessageSquare size={20} />
                           </div>
                           {channel.platform}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                          <Activity size={10} /> {channel.status}
                        </div>
                      </div>

                      <div className="space-y-4 text-xs font-bold">
                        <div className="bg-slate-50 p-4 rounded-2xl flex justify-between border border-slate-100">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Bot Name</p>
                            <p className="text-slate-700">{channel.botName || channel.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Bot ID</p>
                            <p className="text-slate-500 font-mono">{channel.botId || 'N/A'}</p>
                          </div>
                        </div>

                        {channel.webhook && (
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Webhook Endpoint</p>
                              <button 
                                onClick={() => handleCopy(channel.webhook!, channel.id)}
                                className={`flex items-center gap-1 text-[10px] font-black ${copiedId === channel.id ? 'text-emerald-500' : 'text-indigo-600'}`}
                              >
                                {copiedId === channel.id ? <><CheckCircle2 size={12} /> COPIED</> : <><Copy size={12} /> COPY</>}
                              </button>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-2xl text-[10px] font-mono text-slate-400 break-all leading-relaxed shadow-inner border border-slate-800">
                              <span className="text-emerald-500 font-black">POST</span> {channel.webhook}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                  <PlusCircle size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-xl font-black text-slate-800">Chưa có kết nối nào</h3>
                  <p className="text-slate-500 text-sm mt-1">Bấm nút bên dưới để thêm kênh đầu tiên.</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
               <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <PlusCircle size={16} /> THÊM KÊNH TÍCH HỢP MỚI
               </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => !isSubmitting && setIsCreateModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-10">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mb-6">
                <Store size={32} />
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">Tạo Shop mới</h3>
              <p className="text-slate-500 font-medium mb-8">Hệ thống sẽ khởi tạo môi trường riêng cho cửa hàng của bạn.</p>

              <form onSubmit={handleCreateShop} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Tên cửa hàng của bạn</label>
                  <input
                    autoFocus
                    type="text"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="Ví dụ: Tech World Store"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-xs text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!newShopName.trim() || isSubmitting}
                    className={`flex-[2] px-6 py-4 rounded-2xl font-black text-xs text-white shadow-xl transition-all active:scale-95 uppercase tracking-widest ${
                      !newShopName.trim() || isSubmitting 
                      ? 'bg-slate-200 shadow-none' 
                      : 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-100'
                    }`}
                  >
                    {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo'}
                  </button>
                </div>
              </form>
            </div>
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationPage;