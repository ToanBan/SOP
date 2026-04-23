import React, { useEffect, useState, useMemo } from "react";
import getCustomers from "../api/customer/getCustomers";
import updateCustomer from "../api/customer/updateCustomer";
export type PlatformType = "telegram" | "messenger" | "zalo" | string;
import Swal from "sweetalert2";
import replyCustomer from "../api/customer/replyCustomer";
import getConversationByCustomer from "../api/customer/getConversationByCustomer";
import getMessagesByConversation from "../api/customer/getMessagesByConversation";
interface Customer {
  id: string;
  name: string;
  lastSeenAt: string;
  platform: PlatformType;
  phone?: string;
  email?: string;
  createdAt?: string;
  channelAccountId: string;
}

interface Message {
  id: string;
  content: string;
  senderType: "customer" | "admin";
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const PlatformBadge: React.FC<{ platform: PlatformType }> = ({ platform }) => {
  const config: Record<string, { label: string; color: string }> = {
    messenger: {
      label: "Messenger",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    zalo: { label: "Zalo", color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
    telegram: {
      label: "Telegram",
      color: "bg-sky-50 text-sky-600 border-sky-100",
    },
  };
  const current = config[platform.toLowerCase()] || {
    label: platform,
    color: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${current.color}`}
    >
      {current.label}
    </span>
  );
};

const InfoTile: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-tight">
      {label}
    </p>
    <p className="text-xs font-medium text-slate-700 break-all">{value}</p>
  </div>
);

const UpdateCustomerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdate: () => void;
}> = ({ isOpen, onClose, customer, onUpdate }) => {
  if (!isOpen || !customer) return null;

  const [email, setEmail] = useState(customer.email || "");
  const [phone, setPhone] = useState(customer.phone || "");

  const handleSubmitUpdate = async () => {
    try {
      const result = await updateCustomer(customer.id, email, phone);
      if (result.success) {
        const updatedCustomer = result.data;
        Swal.fire({
          icon: "success",
          title: "Cập nhật thành công",
          text: `Thông tin của đã được cập nhật.`,
        });
        onUpdate();
        onClose();
      } else {
        console.error("Failed to update customer:", result.error);
        Swal.fire({
          icon: "error",
          title: "Cập nhật thất bại",
          text:
            result.error || "Đã xảy ra lỗi khi cập nhật thông tin khách hàng.",
        });
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      return { success: false, error: "Failed to update customer" };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
              Cập nhật hồ sơ
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">
                Số điện thoại
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                placeholder="Nhập số điện thoại..."
                defaultValue={customer.phone}
                onChange={(e) => setPhone(e.target.value)}
                name="phone"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">
                Địa chỉ Email
              </label>
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                placeholder="name@company.com"
                defaultValue={customer.email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
            >
              HỦY BỎ
            </button>
            <button
              onClick={handleSubmitUpdate}
              className="flex-1 px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              LƯU THÔNG TIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchCustomers = async () => {
    try {
      const response: ApiResponse<Customer[]> = await getCustomers();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedId) || null;
  }, [customers, selectedId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedCustomer) return;

      setLoadingMessages(true);

      try {
        const convoRes = await getConversationByCustomer(
          selectedCustomer.id,
          selectedCustomer.channelAccountId,
        );

        console.log(convoRes.data);

       

        const conversationId = convoRes.data.id
        console.log("hhhehehe", conversationId);
        setConversationId(conversationId);
        const msgRes = await getMessagesByConversation(conversationId);
        console.log(msgRes.data);
        if (msgRes.success) {
          setMessages(msgRes.data);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error(error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedId, selectedCustomer?.channelAccountId]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, searchTerm]);

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform.toLowerCase()) {
      case "messenger":
        return "🔵";
      case "zalo":
        return "🔹";
      case "telegram":
        return "✈️";
      default:
        return "👤";
    }
  };

  const handleSendMessage = async () => {
    if (!selectedCustomer || !conversationId) return;
    if (!messageInput.trim() && !selectedFile) return;
    
    try {
      const res = await replyCustomer(
        conversationId,
        messageInput,
        selectedCustomer.channelAccountId,
        selectedFile ? selectedFile : null,
      );

      if (res.success) {
        setMessageInput("");
        setSelectedFile(null);
        const msgRes = await getMessagesByConversation(conversationId);
        if (msgRes.success) {
          setMessages(msgRes.data);
        }
      } else {
        Swal.fire("Lỗi", "Không thể gửi tin nhắn", "error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire("Lỗi", "Đã có lỗi xảy ra khi kết nối server", "error");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Customer List Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-black mb-4 tracking-tight text-indigo-600">
            Messages
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingCustomers ? (
            <div className="p-8 text-center text-sm text-slate-400 animate-pulse font-medium">
              Đang tải khách hàng...
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedId(customer.id)}
                className={`mx-3 my-1 p-3 flex gap-3 rounded-2xl cursor-pointer transition-all duration-200 group
                  ${selectedId === customer.id ? "bg-indigo-50 shadow-sm shadow-indigo-100" : "hover:bg-slate-50"}`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-105
                    ${selectedId === customer.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-500"}`}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-[10px] bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                    {getPlatformIcon(customer.platform)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4
                      className={`font-bold text-sm truncate ${selectedId === customer.id ? "text-indigo-900" : "text-slate-700"}`}
                    >
                      {customer.name}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(customer.lastSeenAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight uppercase">
                    {customer.platform}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white relative">
        {selectedCustomer ? (
          <>
            <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 tracking-tight">
                      {selectedCustomer.name}
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-90 shadow-sm"
                      title="Cập nhật thông tin"
                    >
                      <span className="text-sm font-bold">+</span>
                    </button>
                  </div>
                  <PlatformBadge platform={selectedCustomer.platform} />
                </div>
              </div>
              <button className="px-5 py-2.5 bg-indigo-600 text-white text-[11px] font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 tracking-wider">
                CHỐT ĐƠN NHANH
              </button>
            </header>

            {/* Messages Content */}
            <section className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] space-y-6">
              {loadingMessages ? (
                <div className="flex flex-col justify-center items-center h-full gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-xs font-medium italic">
                    Đang đồng bộ tin nhắn...
                  </p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === "customer" ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`px-4 py-3 rounded-[1.25rem] max-w-[70%] text-sm shadow-sm leading-relaxed ${
                        msg.senderType === "admin"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100"
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-100"
                      }`}
                    >
                      {msg.content}
                      <div
                        className={`text-[9px] mt-1.5 font-medium opacity-60 ${msg.senderType === "admin" ? "text-right" : "text-left"}`}
                      >
                        10:30 AM
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-slate-300 opacity-60">
                  <div className="text-4xl mb-2">🕊️</div>
                  <p className="text-xs font-medium">
                    Bắt đầu cuộc trò chuyện mới
                  </p>
                </div>
              )}
            </section>

            <footer className="p-4 bg-white border-t border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-3 bg-slate-50 p-2 rounded-[1.5rem] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 focus-within:border-indigo-200 border border-transparent transition-all"
              >
                {/* PHẦN CHỌN FILE */}
                <div className="flex items-center ps-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                  <label
                    htmlFor="file-upload"
                    className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedFile
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                    title={selectedFile ? selectedFile.name : "Đính kèm tệp"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.5l-10.74 10.74a1.5 1.5 0 11-2.12-2.12l10.103-10.103"
                      />
                    </svg>
                  </label>
                </div>

                <div className="flex-1 flex flex-col">
                  {selectedFile && (
                    <span className="text-[10px] font-bold text-indigo-600 px-3 pt-1 truncate max-w-[200px]">
                      📎 {selectedFile.name}
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="ml-2 text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  <textarea
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Nhắn tin cho ${selectedCustomer.name}...`}
                    className="bg-transparent border-none focus:ring-0 px-1 py-2 text-sm resize-none max-h-32"
                  />
                </div>

                {/* NÚT GỬI */}
                <button
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90 flex items-center justify-center"
                >
                  <span className="transform -rotate-12">🚀</span>
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-slate-200/50">
              💬
            </div>
            <h3 className="text-slate-800 font-bold mb-1">Hộp thoại trống</h3>
            <p className="text-sm font-medium opacity-70">
              Chọn một khách hàng từ danh sách để bắt đầu
            </p>
          </div>
        )}
      </main>

      {/* Info Sidebar */}
      <aside className="w-72 bg-white border-l border-slate-200 p-8 hidden xl:block shrink-0 z-10">
        {selectedCustomer && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="font-black text-slate-800 mb-8 tracking-tight border-b border-slate-100 pb-4">
              Hồ sơ khách hàng
            </h3>
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[2.5rem] mb-5 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-200 rotate-3">
                {selectedCustomer.name.substring(0, 2).toUpperCase()}
              </div>
              <p className="font-black text-slate-800 text-lg tracking-tight">
                {selectedCustomer.name}
              </p>
              <div className="mt-2">
                <PlatformBadge platform={selectedCustomer.platform} />
              </div>
            </div>
            <div className="space-y-4">
              <InfoTile label="ID Hệ thống" value={selectedCustomer.id} />
              <InfoTile
                label="Kênh kết nối"
                value={selectedCustomer.channelAccountId}
              />
              <InfoTile
                label="Hoạt động cuối"
                value={new Date(selectedCustomer.lastSeenAt).toLocaleString(
                  "vi-VN",
                  { dateStyle: "medium", timeStyle: "short" },
                )}
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-10 py-4 bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              CHỈNH SỬA CHI TIẾT
            </button>
          </div>
        )}
      </aside>

      {/* MODAL CẬP NHẬT */}
      <UpdateCustomerModal
        onUpdate={fetchCustomers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default ChatPage;
