import api from "../../lib/axios"

const getMessageByCustomer = async(customerId: string, channelAccountId: string) => {
  try {
    const res = await api.post("/chat/messages", { customerId, channelAccountId });
    return res.data;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { success: false, message: "Failed to fetch messages" };
  }
}

export default getMessageByCustomer
