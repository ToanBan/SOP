import api from "../../lib/axios"

const getPermissionsByRole = async(roleId:string) => {
  try {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/rbac/${roleId}/permissions`)
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default getPermissionsByRole
