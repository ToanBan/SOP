import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink,
  ShieldCheck,
  Settings2,
  ArrowRight,
  Send,
  X,
  Copy,
  Check,
  Bot,
  Zap,
  ChevronRight
} from 'lucide-react';

// --- Components Phụ ---

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5c3.5-1 5.5-1 9 0"/><path d="M7 16.5c3.5 1 6.5 1 10 0"/><path d="M2 12c0 4.4 3.6 8 8 8 1.5 0 2.8-.4 4-1.1 1.2.7 2.5 1.1 4 1.1 4.4 0 8-3.6 8-8s-3.6-8-8-8c-1.5 0-2.8.4-4 1.1C10.8 4.4 9.5 4 8 4c-4.4 0-8 3.6-8 8z"/></svg>
);

// --- Component Modal Hướng Dẫn Telegram ---

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TelegramGuideModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [apiToken, setApiToken] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      title: "Truy cập BotFather",
      desc: "Mở ứng dụng Telegram, tìm kiếm từ khóa @BotFather (có tích xanh) để bắt đầu khởi tạo.",
      action: <a href="https://t.me/botfather" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-blue-500 font-bold text-sm hover:text-blue-600 transition-colors">Mở BotFather ngay <ExternalLink size={14}/></a>
    },
    {
      title: "Gửi lệnh tạo Bot",
      desc: "Gửi dòng lệnh dưới đây vào khung chat. BotFather sẽ yêu cầu bạn đặt tên hiển thị và username cho bot.",
      command: "/newbot"
    },
    {
      title: "Sao chép API Token",
      desc: "Sau khi hoàn tất, bạn sẽ nhận được một chuỗi ký tự dài (API Token). Hãy dán nó vào khung bên dưới.",
    }
  ];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-8"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[3rem] bg-white p-10 text-left align-middle shadow-2xl transition-all border border-slate-100">
                
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-gradient-to-br from-[#0088cc] to-[#00a2ed] text-white rounded-3xl shadow-xl shadow-blue-100">
                      <Bot size={32} />
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-black text-slate-900 tracking-tight">
                        Thiết lập Telegram Bot
                      </Dialog.Title>
                      <p className="text-slate-400 text-sm font-medium">Làm theo các bước để lấy mã kết nối</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8 relative">
                  {/* Đường kẻ dọc nối các bước */}
                  <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-slate-100" />

                  {steps.map((step, idx) => (
                    <div key={idx} className="relative flex gap-8 group">
                      <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-800 font-black text-xl shadow-sm group-hover:border-blue-400 group-hover:text-blue-50 transition-all group-hover:bg-blue-500">
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-lg font-bold text-slate-800 mb-1.5">{step.title}</h4>
                        <p className="text-slate-500 text-[15px] leading-relaxed mb-4">{step.desc}</p>
                        
                        {step.command && (
                          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl font-mono text-sm group/cmd hover:bg-slate-100 transition-colors">
                            <span className="text-indigo-600 font-bold">{step.command}</span>
                            <button 
                              onClick={() => copyToClipboard(step.command!)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {copied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18}/>}
                            </button>
                          </div>
                        )}
                        {step.action}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <label className="block text-[13px] font-black uppercase tracking-wider text-slate-400 mb-4 ml-1">
                    Mã HTTP API Token
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Dán token vào đây..."
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all font-medium"
                    />
                    <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group">
                      <Zap size={18} className="group-hover:animate-pulse" /> Kết nối
                    </button>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- Component Trang Chính ---

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isConnected: boolean;
}

const ConnectionPage: React.FC = () => {
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [platforms] = useState<Platform[]>([
    {
      id: 'facebook',
      name: 'Facebook Fanpage',
      icon: <FacebookIcon />,
      color: 'bg-[#1877F2]',
      description: 'Đồng bộ tin nhắn và bình luận từ nhiều Fanpage về hệ thống quản lý.',
      isConnected: true,
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      icon: <Send size={24} />,
      color: 'bg-[#0088cc]',
      description: 'Kết nối API Bot để quản lý hội thoại từ cá nhân và Group Telegram.',
      isConnected: false,
    },
    {
      id: 'discord',
      name: 'Discord Webhook',
      icon: <DiscordIcon />,
      color: 'bg-[#5865F2]',
      description: 'Tích hợp nhận thông báo và phản hồi tin nhắn từ các server Discord.',
      isConnected: false,
    },
  ]);

  const handleConnect = (id: string) => {
    if (id === 'telegram') {
      setIsTelegramModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Settings2 size={28} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Cấu hình Hub Đa Kênh
              </h1>
            </div>
            <p className="text-slate-500 text-lg">
              Kết nối Webhook để đưa toàn bộ hội thoại khách hàng về một nơi duy nhất.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-sm font-bold">
            <ShieldCheck size={18} className="text-emerald-500" />
            Bảo mật SSL 256-bit
          </div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((platform) => (
            <div 
              key={platform.id}
              className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-3xl text-white shadow-xl ${platform.color} ring-8 ring-slate-50`}>
                  {platform.icon}
                </div>
                {platform.isConnected ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Đã kết nối
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    Chưa kết nối
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {platform.name}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-8 min-h-[60px]">
                {platform.description}
              </p>

              <div className="flex items-center gap-3">
                {platform.isConnected ? (
                  <>
                    <button className="flex-1 bg-slate-900 text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-indigo-600 transition-all text-sm shadow-lg shadow-slate-200">
                      Thiết lập API
                    </button>
                    <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100">
                      <ExternalLink size={20} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleConnect(platform.id)}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-100 py-3.5 px-6 rounded-2xl font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all group/btn text-sm shadow-sm"
                  >
                    Bắt đầu kết nối
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Custom Webhook Placeholder */}
          <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
            <div className="p-5 bg-slate-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle size={32} className="text-slate-300 group-hover:text-indigo-500" />
            </div>
            <span className="font-bold text-slate-600">Custom Webhook</span>
            <p className="text-xs mt-1">Dành cho hệ thống riêng</p>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      <TelegramGuideModal 
        isOpen={isTelegramModalOpen} 
        onClose={() => setIsTelegramModalOpen(false)} 
      />
    </div>
  );
};

export default ConnectionPage;