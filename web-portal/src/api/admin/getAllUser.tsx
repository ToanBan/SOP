import api from "../../lib/axios"
const getAllUser = async() => {
  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/rbac/users`)
    return res.data
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default getAllUser
