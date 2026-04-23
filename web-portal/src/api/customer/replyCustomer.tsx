import api from "../../lib/axios"


const replyCustomer = async(conversationId: string, message: string, channelAccountId: string, file: File | null) => {
  try {
    const res = await api.post("/chat/reply", { conversationId, message, channelAccountId, file });
    return res.data;
  } catch (error) {
    console.error("Error replying to customer:", error)
    return  {success: false, message: "Failed to reply to customer."}
  }
}

export default replyCustomer
