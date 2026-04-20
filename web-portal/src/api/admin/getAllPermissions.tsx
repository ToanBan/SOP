import api from "../../lib/axios";

const getAllPermissions = async() => {
  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/rbac/permissions`)
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default getAllPermissions
