import api from "../../lib/axios"

const getConversations = async() => {
  try {
    const res = await api.get("/marketing")
    return res.data
  } catch (error) {
    console.error(error);
    return {success:false, data:[]}
  }
}

export default getConversations
