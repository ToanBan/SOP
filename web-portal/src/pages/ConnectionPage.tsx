import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
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
} from "lucide-react";
import handleConnection from "../api/user/handleConnection";
import Swal from "sweetalert2";
import handleConnectionDiscord from "../api/user/handleConnectionDiscord";


const DiscordIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
    <path d="M7 16.5c3.5 1 6.5 1 10 0" />
    <path d="M2 12c0 4.4 3.6 8 8 8 1.5 0 2.8-.4 4-1.1 1.2.7 2.5 1.1 4 1.1 4.4 0 8-3.6 8-8s-3.6-8-8-8c-1.5 0-2.8.4-4 1.1C10.8 4.4 9.5 4 8 4c-4.4 0-8 3.6-8 8z" />
  </svg>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TelegramGuideModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [apiToken, setApiToken] = useState("");

  const steps = [
    {
      title: "Truy cập BotFather",
      desc: "Mở ứng dụng Telegram, tìm kiếm từ khóa @BotFather để bắt đầu khởi tạo.",
      action: (
        <a
          href="https://t.me/botfather"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-500 font-bold text-sm hover:text-blue-600 transition-colors"
        >
          Mở BotFather ngay <ExternalLink size={14} />
        </a>
      ),
    },
    {
      title: "Gửi lệnh tạo Bot",
      desc: "Gửi dòng lệnh dưới đây vào khung chat để lấy username cho bot.",
      command: "/newbot",
    },
    {
      title: "Sao chép API Token",
      desc: "Dán chuỗi ký tự API Token nhận được vào khung bên dưới.",
    },
  ];

  const handleSubmit = async () => {
    const result = await handleConnection(apiToken);
    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã kết nối Telegram Bot!",
      });
      onClose();
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: result.error || "Kết nối thất bại",
      });
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thiết lập Telegram Bot"
      subtitle="Lấy mã kết nối từ BotFather"
      icon={<Bot size={32} />}
      color="from-[#0088cc] to-[#00a2ed]"
    >
      <div className="space-y-8 relative">
        <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-slate-100" />
        {steps.map((step, idx) => (
          <StepItem
            key={idx}
            idx={idx}
            step={step}
            copied={copied}
            setCopied={setCopied}
            activeColor="group-hover:bg-blue-500"
          />
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
            className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none transition-all"
          />
          <button
            onClick={handleSubmit}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Zap size={18} /> Kết nối
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

const DiscordGuideModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      title: "Mở Discord Developer Portal",
      desc: "Truy cập trang quản lý ứng dụng của Discord để bắt đầu tạo Bot.",
      action: (
        <a
          href="https://discord.com/developers/applications"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[#5865F2] font-bold text-sm hover:underline mt-2"
        >
          Mở Developer Portal <ExternalLink size={14} />
        </a>
      ),
    },
    {
      title: "Tạo Application & Bot",
      desc: "Chọn 'New Application', sau đó vào mục 'Bot' và nhấn 'Reset Token' để lấy mã.",
      command: "Bot → Reset Token",
    },
    {
      title: "Cấu hình Privileged Intents",
      desc: "Bật 'Message Content Intent' trong mục Bot để bot có thể đọc được tin nhắn.",
    },
    {
      title: "Lấy Channel ID",
      desc: "Bật Chế độ nhà phát triển trong Discord, sau đó chuột phải vào kênh và chọn Copy ID.",
      command: "Copy Channel ID",
    },
  ];

  const handleConnect = async () => {
    const result = await handleConnectionDiscord(botToken);
    if (result.success) {
      Swal.fire({ icon: "success", title: "Thành công", text: "Đã kết nối Discord!" });
      onClose();
    } else {
      Swal.fire({ icon: "error", title: "Lỗi", text: result.error || "Kết nối thất bại" });
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thiết lập Discord Bot"
      subtitle="Kết nối máy chủ Discord qua Token & Channel ID"
      icon={<DiscordIcon />}
      color="from-[#5865F2] to-[#727CFF]"
    >
      <div className="space-y-8 relative">
        {/* Đường line dọc nối các bước */}
        <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-slate-100" />
        
        {steps.map((step, idx) => (
          <StepItem
            key={idx}
            idx={idx}
            step={step}
            copied={copied}
            setCopied={setCopied}
            activeColor="group-hover:bg-[#5865F2]"
          />
        ))}
      </div>

      <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
        <label className="block text-[13px] font-black uppercase tracking-wider text-slate-400 mb-4 ml-1">
          Thông tin cấu hình
        </label>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Discord Bot Token"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-[#5865F2] outline-none transition-all bg-white"
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="Channel ID"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-[#5865F2] outline-none transition-all bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="w-full bg-[#5865F2] text-white py-4 rounded-2xl font-bold hover:bg-[#4752C4] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Zap size={18} /> Xác nhận kết nối
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

const BaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, subtitle, icon, color, children }) => (
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
        <div className="flex min-h-full items-center justify-center p-4">
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
                  <div
                    className={`p-4 bg-gradient-to-br ${color} text-white rounded-3xl shadow-xl shadow-blue-100`}
                  >
                    {icon}
                  </div>
                  <div>
                    <Dialog.Title className="text-2xl font-black text-slate-900 tracking-tight">
                      {title}
                    </Dialog.Title>
                    <p className="text-slate-400 text-sm font-medium">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"
                >
                  <X size={24} />
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

const StepItem = ({ idx, step, copied, setCopied, activeColor }: any) => (
  <div className="relative flex gap-8 group">
    <div
      className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-800 font-black text-xl shadow-sm transition-all group-hover:text-white ${activeColor}`}
    >
      {idx + 1}
    </div>
    <div className="flex-1 pt-1">
      <h4 className="text-lg font-bold text-slate-800 mb-1.5">{step.title}</h4>
      <p className="text-slate-500 text-[15px] leading-relaxed mb-4">
        {step.desc}
      </p>
      {step.command && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl font-mono text-sm group/cmd hover:bg-slate-100 transition-colors">
          <span className="text-indigo-600 font-bold">{step.command}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(step.command);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {copied ? (
              <Check size={18} className="text-emerald-500" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
      )}
      {step.action}
    </div>
  </div>
);

// --- Main Page ---
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
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);

  const platforms: Platform[] = [
    {
      id: "telegram",
      name: "Telegram Bot",
      icon: <Send size={24} />,
      color: "bg-[#0088cc]",
      description:
        "Kết nối API Bot để quản lý hội thoại từ cá nhân và Group Telegram.",
      isConnected: false,
    },
    {
      id: "discord",
      name: "Discord Webhook",
      icon: <DiscordIcon />,
      color: "bg-[#5865F2]",
      description:
        "Tích hợp nhận thông báo và phản hồi tin nhắn từ các server Discord.",
      isConnected: false,
    },
  ];

  const handleConnect = (id: string) => {
    if (id === "telegram") setIsTelegramModalOpen(true);
    if (id === "discord") setIsDiscordModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
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
              Kết nối Webhook để đưa toàn bộ hội thoại khách hàng về một nơi duy
              nhất.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-sm font-bold">
            <ShieldCheck size={18} className="text-emerald-500" /> Bảo mật SSL
            256-bit
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-8">
                <div
                  className={`p-4 rounded-3xl text-white shadow-xl ${platform.color} ring-8 ring-slate-50`}
                >
                  {platform.icon}
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${platform.isConnected ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-50 border-slate-100"}`}
                >
                  {platform.isConnected && (
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5" />
                  )}
                  {platform.isConnected ? "Đã kết nối" : "Chưa kết nối"}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {platform.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 min-h-[60px]">
                {platform.description}
              </p>
              <div className="flex items-center gap-3">
                {platform.isConnected ? (
                  <button className="flex-1 bg-slate-900 text-white py-3.5 px-6 rounded-2xl font-bold hover:bg-indigo-600 transition-all text-sm shadow-lg">
                    Thiết lập API
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-100 py-3.5 px-6 rounded-2xl font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all group/btn text-sm"
                  >
                    Bắt đầu kết nối{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
            <div className="p-5 bg-slate-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle size={32} className="group-hover:text-indigo-500" />
            </div>
            <span className="font-bold text-slate-600">Custom Webhook</span>
          </div>
        </div>
      </div>

      <TelegramGuideModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
      <DiscordGuideModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />
    </div>
  );
};

export default ConnectionPage;
