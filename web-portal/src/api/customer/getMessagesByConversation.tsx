import api from "../../lib/axios";

const getMessagesByConversation = async(conversationId:string) => {
  try {
    const res = await api.get(`/chat/messages/${conversationId}`)
    return res.data
  } catch (error) {
    console.error(error);
    return {success:false, message:"Failed"}
  }
}

export default getMessagesByConversation
