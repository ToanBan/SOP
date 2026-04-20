import api from "../../lib/axios";

const assignRole = async (userId: string, roleIds: string[]) => {
  try {
    const res = await api.post(
      `${import.meta.env.VITE_API_URL}/rbac/assign-role`,
      {
        userId,
        roleIds,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to assign roles" };
  }
};

export default assignRole;
