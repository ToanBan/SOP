import api from "../../lib/axios"

const getReactions = async(campaignId:string) => {
  try {
    const res = await api.get(`/marketing/channelAccount/${campaignId}`)
    return res.data
  } catch (error) {
    return {success:false, message:`Failed ${error}`}
  }
}

export default getReactions
