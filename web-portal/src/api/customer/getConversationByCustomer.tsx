import api from "../../lib/axios";

const getConversationByCustomer = async(customerId:string, channelAccountId:string) => {
  try {
    const res = await api.post("/chat/conversation", {customerId, channelAccountId})
    return res.data
  } catch (error) {
    console.error(error);
    return {success:false, message:"Failed"}
  }
}

export default getConversationByCustomer
