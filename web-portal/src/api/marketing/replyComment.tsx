import api from "../../lib/axios"

const replyComment = async(campaignId:string, message:string, commentId?:string) => {
  try {
    const res = await api.post("/marketing/campaign/reply", {
        campaignId, commentId, message
    })
    return res.data;
  } catch (error) {
    return {success:false, message:`Failed ${error}`}
  }
}

export default replyComment
