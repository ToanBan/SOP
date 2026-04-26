import api from "../../lib/axios"

const getChannelAccountByIntegration = async(integrationId:string) => {
  try {
    const res = await api.get(`/integration/${integrationId}`)
    return res.data
  } catch (error) {
    console.error(error);
    return {success:false, message:`failed ${error}`}
  }
}

export default getChannelAccountByIntegration
