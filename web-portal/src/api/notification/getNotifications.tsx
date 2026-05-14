import api from "../../lib/axios"
const getNotifications = async(page: number = 1) => {
  try {
    const res = await api.get(`/notification/${page}`)
    return res.data;
  } catch (error) {
    console.error(error);
    return {success:false, message:`Failed ${error}`}
  }
}

export default getNotifications
