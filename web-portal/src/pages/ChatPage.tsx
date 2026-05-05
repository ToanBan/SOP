import React, { useEffect, useState, useMemo, useRef } from "react";
import getCustomers from "../api/customer/getCustomers";
import updateCustomer from "../api/customer/updateCustomer";
import Swal from "sweetalert2";
import replyCustomer from "../api/customer/replyCustomer";
import getConversationByCustomer from "../api/customer/getConversationByCustomer";
import getMessagesByConversation from "../api/customer/getMessagesByConversation";
import getGroups from "../api/customer/getGroups";
import { useSocket } from "../hooks/useSocket";
export type PlatformType = "telegram" | "messenger" | "zalo" | string;

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

interface GroupProps {
  id: string;
  channelAccountId: string;
  type: string;
  title: string;
  conversationType: string;
}

interface Message {
  id: string;
  content: string;
  senderType: "customer" | "admin";
  createdAt: string;
  customerName: string;
  mediaUrl?: string | null;
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

const MediaMessage: React.FC<{ mediaUrl: string; isAdmin: boolean }> = ({
  mediaUrl,
  isAdmin,
}) => {
  const [isImage, setIsImage] = useState(true);
  const fileName = mediaUrl.split("/").pop() || "file";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const isImageExt = imageExts.includes(ext);

  if (!isImageExt) {
    return (
      <a
        href={mediaUrl}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-opacity hover:opacity-80 ${
          isAdmin ? "bg-indigo-500" : "bg-slate-100"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isAdmin ? "bg-indigo-400" : "bg-slate-200"
          }`}
        >
          <span className="text-base">📎</span>
        </div>
        <div className="min-w-0">
          <p
            className={`text-xs font-bold truncate max-w-[160px] ${
              isAdmin ? "text-white" : "text-slate-700"
            }`}
          >
            {fileName}
          </p>
          <p
            className={`text-[10px] ${
              isAdmin ? "text-indigo-200" : "text-slate-400"
            }`}
          >
            Nhấn để tải xuống
          </p>
        </div>
      </a>
    );
  }

  return isImage ? (
    <img
      src={mediaUrl}
      alt="media"
      className="w-full max-w-xs rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => window.open(mediaUrl, "_blank")}
      onError={() => setIsImage(false)}
    />
  ) : (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2 px-4 py-3 text-xs underline ${
        isAdmin ? "text-indigo-200" : "text-slate-500"
      }`}
    >
      <span>📎</span>
      <span>{fileName}</span>
    </a>
  );
};

const UpdateCustomerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdate: () => void;
}> = ({ isOpen, onClose, customer, onUpdate }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (customer) {
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmitUpdate = async () => {
    try {
      const result = await updateCustomer(customer.id, email, phone);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thông tin đã được cập nhật.",
        });
        onUpdate();
        onClose();
      } else {
        Swal.fire({ icon: "error", title: "Lỗi", text: result.error });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black text-slate-800 mb-6">
          Cập nhật hồ sơ
        </h3>
        <div className="space-y-5">
          <input
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-300 transition-colors"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-300 transition-colors"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            HỦY
          </button>
          <button
            onClick={handleSubmitUpdate}
            className="flex-1 py-3.5 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            LƯU
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [groups, setGroups] = useState<GroupProps[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [activeChat, setActiveChat] = useState<{
    id: string;
    type: "customer" | "group";
  } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoadingCustomers(true);
    try {
      const [custRes, groupRes] = await Promise.all([
        getCustomers(),
        getGroups(),
      ]);
      if (custRes.success) setCustomers(custRes.data);
      if (groupRes.success) setGroups(groupRes.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreviewUrl(null);
  }, [selectedFile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedCustomer = useMemo(() => {
    if (activeChat?.type === "customer")
      return customers.find((c) => c.id === activeChat.id) || null;
    return null;
  }, [customers, activeChat]);

  const selectedGroup = useMemo(() => {
    if (activeChat?.type === "group")
      return groups.find((g) => g.id === activeChat.id) || null;
    return null;
  }, [groups, activeChat]);

  const handleSelectCustomer = async (cust: Customer) => {
    setActiveChat({ id: cust.id, type: "customer" });
    setMessages([]);
    try {
      const convoRes = await getConversationByCustomer(
        cust.id,
        cust.channelAccountId,
      );
      if (convoRes.success) {
        setConversationId(convoRes.data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectGroup = (group: GroupProps) => {
    setActiveChat({ id: group.id, type: "group" });
    setConversationId(group.id);
    setMessages([]);
  };

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const msgRes = await getMessagesByConversation(conversationId);
        setMessages(msgRes.success ? msgRes.data : []);
      } catch (e) {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!conversationId || (!messageInput.trim() && !selectedFile)) return;
    const channelId =
      selectedCustomer?.channelAccountId ||
      selectedGroup?.channelAccountId ||
      "";

    const currentMessage = messageInput;
    const currentFile = selectedFile;

    setMessageInput("");
    setSelectedFile(null);

    try {
      const res = await replyCustomer(
        conversationId,
        currentMessage,
        channelId,
        currentFile,
      );

      if (!res.success) {
        setMessageInput(currentMessage);
        setSelectedFile(currentFile);
        Swal.fire("Lỗi", "Không thể gửi tin nhắn", "error");
      }
    } catch (error) {
      setMessageInput(currentMessage);
      setSelectedFile(currentFile);
      console.error(error);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useSocket(conversationId || null, (newMessage) => {
    console.log("new message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-black mb-4 text-indigo-600 tracking-tight">
            Messages
          </h2>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Groups */}
          {groups.length > 0 && (
            <div className="mt-4 px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
                Groups
              </p>
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={`p-3 mb-1 flex items-center gap-3 rounded-2xl cursor-pointer transition-all ${
                    activeChat?.id === group.id
                      ? "bg-indigo-50 shadow-sm"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {group.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-700 truncate">
                      {group.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                      {group.conversationType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customers */}
          <div className="mt-4 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
              Direct Messages
            </p>
            {loadingCustomers ? (
              <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
                Đang tải...
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`p-3 mb-1 flex gap-3 rounded-2xl cursor-pointer transition-all ${
                    activeChat?.id === customer.id
                      ? "bg-indigo-50 shadow-sm"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-700 truncate">
                      {customer.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {customer.platform}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col bg-white relative overflow-hidden">
        {conversationId ? (
          <>
            {/* Header */}
            <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md shrink-0">
              <div>
                <h3 className="font-black text-slate-800">
                  {selectedCustomer?.name || selectedGroup?.title}
                </h3>
                {selectedCustomer && (
                  <PlatformBadge platform={selectedCustomer.platform} />
                )}
                {selectedGroup && (
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">
                    Group Chat
                  </span>
                )}
              </div>
              {activeChat?.type === "customer" && (
                <button className="px-5 py-2.5 bg-indigo-600 text-white text-[11px] font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                  CHỐT ĐƠN
                </button>
              )}
            </header>

            {/* Messages */}
            <section className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === "customer"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div className="flex flex-col max-w-[70%]">
                      {/* Tên trong group */}
                      {selectedGroup &&
                        msg.senderType === "customer" &&
                        msg.customerName && (
                          <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                            {msg.customerName}
                          </span>
                        )}

                      <div
                        className={`rounded-2xl text-sm overflow-hidden ${
                          msg.senderType === "admin"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm"
                        }`}
                      >
                        {/* Media */}
                        {msg.mediaUrl && (
                          <MediaMessage
                            mediaUrl={msg.mediaUrl}
                            isAdmin={msg.senderType === "admin"}
                          />
                        )}

                        {/* Text content */}
                        {msg.content && (
                          <div className="px-4 py-3">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </section>

            {/* Footer */}
            <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
              {/* File preview */}
              {selectedFile && (
                <div className="mb-3 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2.5">
                  {/* Ảnh preview nếu là image */}
                  {filePreviewUrl ? (
                    <img
                      src={filePreviewUrl}
                      alt="preview"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white text-lg">📎</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-indigo-700 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-indigo-400 mt-0.5">
                      {selectedFile.type || "File"} ·{" "}
                      {selectedFile.size < 1024 * 1024
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedFile(null)}
                    className="w-7 h-7 bg-indigo-200 hover:bg-indigo-300 rounded-full flex items-center justify-center text-indigo-700 font-black text-sm transition-colors shrink-0"
                  >
                    ×
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-transparent focus-within:bg-white focus-within:border-indigo-200 transition-all"
              >
                {/* File button */}
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
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                      selectedFile
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-400 hover:text-indigo-600"
                    }`}
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

                {/* Textarea */}
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
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent border-none focus:ring-0 px-1 py-2 text-sm resize-none outline-none"
                />

                {/* Send button */}
                <button
                  type="submit"
                  className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-90"
                >
                  🚀
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-sm font-medium">
              Chọn một cuộc trò chuyện để bắt đầu
            </p>
          </div>
        )}
      </main>

      {/* Info Sidebar */}
      <aside className="w-72 bg-white border-l border-slate-200 p-8 hidden xl:block z-10">
        {selectedCustomer ? (
          <div>
            <h3 className="font-black text-slate-800 mb-8 border-b pb-4">
              Hồ sơ khách hàng
            </h3>
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mb-4 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-100">
                {selectedCustomer.name.substring(0, 2).toUpperCase()}
              </div>
              <p className="font-black text-slate-800 text-lg">
                {selectedCustomer.name}
              </p>
              <PlatformBadge platform={selectedCustomer.platform} />
            </div>
            <div className="space-y-4">
              <InfoTile label="ID Hệ thống" value={selectedCustomer.id} />
              <InfoTile
                label="Kênh"
                value={selectedCustomer.channelAccountId}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-10 py-4 bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-slate-800 active:scale-95 transition-all"
            >
              CHỈNH SỬA
            </button>
          </div>
        ) : selectedGroup ? (
          <div>
            <h3 className="font-black text-slate-800 mb-8 border-b pb-4">
              Thông tin nhóm
            </h3>
            <div className="space-y-4">
              <InfoTile label="Tên nhóm" value={selectedGroup.title} />
              <InfoTile label="Loại" value={selectedGroup.conversationType} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-200">
            <p className="text-sm font-medium text-center">
              Chọn một cuộc trò chuyện để xem thông tin
            </p>
          </div>
        )}
      </aside>

      <UpdateCustomerModal
        onUpdate={fetchData}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default ChatPage;
