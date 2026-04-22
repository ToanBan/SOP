import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Smile, 
  X, 
  Globe, 
  Send, 
  Plus,
  Calendar,
  Check,
  Search,
  LayoutDashboard
} from 'lucide-react';

// SVG Icons cho các Brand
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const DiscordIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5c3.5-1 5.5-1 9 0"/><path d="M7 16.5c3.5 1 6.5 1 10 0"/><path d="M2 12c0 4.4 3.6 8 8 8 1.5 0 2.8-.4 4-1.1 1.2.7 2.5 1.1 4 1.1 4.4 0 8-3.6 8-8s-3.6-8-8-8c-1.5 0-2.8.4-4 1.1C10.8 4.4 9.5 4 8 4c-4.4 0-8 3.6-8 8z"/></svg>
);

interface Channel {
  id: string;
  name: string;
  platform: 'facebook' | 'telegram' | 'discord';
  avatar: string;
}

const PostPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['ch-1']);

  const channels: Channel[] = [
    { id: 'ch-1', name: 'Thời Trang GenZ (Page)', platform: 'facebook', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'ch-2', name: 'Đồ Gia Dụng Thông Minh', platform: 'facebook', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'ch-3', name: 'Thông báo đơn hàng Bot', platform: 'telegram', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'ch-4', name: 'Cộng đồng UI/UX', platform: 'discord', avatar: 'https://i.pravatar.cc/150?u=4' },
  ];

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col h-screen">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Publisher Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
              <Calendar size={18} /> Lên lịch sau
            </button>
            <button className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all">
              Đăng ngay ({selectedChannels.length})
            </button>
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden">
          
          {/* Cột 1: Danh sách các kênh đã kết nối */}
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Chọn kênh đăng</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Tìm kênh..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {channels.map((channel) => (
                <div 
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id)}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${
                    selectedChannels.includes(channel.id) 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="relative">
                    <img src={channel.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-md text-white shadow-sm ${
                      channel.platform === 'facebook' ? 'bg-blue-600' : 
                      channel.platform === 'telegram' ? 'bg-sky-500' : 'bg-indigo-500'
                    }`}>
                      {channel.platform === 'facebook' ? <FacebookIcon size={10} /> : 
                       channel.platform === 'telegram' ? <Send size={10} /> : <DiscordIcon size={10} />}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-700 truncate">{channel.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{channel.platform}</p>
                  </div>
                  {selectedChannels.includes(channel.id) && (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100">
              <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Thêm kênh mới
              </button>
            </div>
          </aside>

          {/* Cột 2: Trình soạn thảo */}
          <section className="flex-1 bg-slate-50 p-10 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8">
                  <textarea
                    className="w-full min-h-[300px] border-none focus:ring-0 text-xl text-slate-800 placeholder-slate-300 resize-none font-medium leading-relaxed"
                    placeholder="Nội dung bài đăng của bạn..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="w-28 h-28 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 cursor-pointer bg-slate-50/50 transition-all gap-1">
                      <ImageIcon size={28} />
                      <span className="text-[10px] font-black uppercase">Ảnh</span>
                    </div>
                    <div className="w-28 h-28 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 cursor-pointer bg-slate-50/50 transition-all gap-1">
                      <Video size={28} />
                      <span className="text-[10px] font-black uppercase">Video</span>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-6 text-slate-400">
                    <Smile className="cursor-pointer hover:text-indigo-600 transition-colors" size={22} />
                    <Globe className="cursor-pointer hover:text-indigo-600 transition-colors" size={22} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-300 tracking-widest">{content.length} KÝ TỰ</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cột 3: Preview */}
          <aside className="w-[450px] bg-white border-l border-slate-200 p-8 overflow-y-auto">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Xem trước (Facebook)</h2>
                <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                  <Plus size={16} />
                </div>
              </div>

              {/* Facebook Post Mockup */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                    <img src={channels[0].avatar} alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{channels[0].name}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">Vừa xong • <Globe size={10} /></p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-[14px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {content || "Bản xem trước nội dung sẽ xuất hiện tại đây..."}
                  </p>
                </div>
                <div className="aspect-video bg-slate-100 flex items-center justify-center border-y border-slate-100">
                  <ImageIcon size={48} className="text-slate-200" />
                </div>
                <div className="p-3 flex justify-around border-t border-slate-50">
                   <div className="h-2 w-16 bg-slate-100 rounded-full" />
                   <div className="h-2 w-16 bg-slate-100 rounded-full" />
                   <div className="h-2 w-16 bg-slate-100 rounded-full" />
                </div>
              </div>

              <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                <h4 className="text-xs font-black text-indigo-600 uppercase mb-2">Mẹo nhỏ</h4>
                <p className="text-xs text-indigo-700/70 leading-relaxed">Nên sử dụng hình ảnh có kích thước 1200x630 pixel để hiển thị tốt nhất trên Facebook.</p>
              </div>
            </div>
          </aside>

        </main>
      </div>
    </div>
  );
};

export default PostPage;