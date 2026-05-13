import api from "../../lib/axios"

const getComments = async(campaignId:string) => {
    try {
        const res = await api.get(`/marketing/channelAccount/comments/${campaignId}`)
        return res.data
    } catch (error) {
        return {success:false, message:`Failed ${error}`}
    }
}

export default getComments
