import api from "../../lib/axios"
const getAllRoles = async() => {
  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/rbac/roles`)
    return res.data
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default getAllRoles
