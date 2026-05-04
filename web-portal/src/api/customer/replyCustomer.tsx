import api from "../../lib/axios";

const replyCustomer = async (
  conversationId: string,
  message: string,
  channelAccountId: string,
  file: File | null,
) => {
  try {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("message", message);
    formData.append("channelAccountId", channelAccountId);
    if (file) formData.append("file", file);
    const res = await api.post("/chat/reply", formData);
    return res.data;
  } catch (error) {
    console.error("Error replying to customer:", error);
    return { success: false, message: "Failed to reply to customer." };
  }
};

export default replyCustomer;
