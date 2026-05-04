import api from '../../lib/axios'
const getAllCampaign = async() => {
  try {
    const res = await api.get("/marketing/campaign")
    return res.data
  } catch (error) {
    console.error(error);
    return {success:false, message:`failed ${error}`}
  }
}

export default getAllCampaign
