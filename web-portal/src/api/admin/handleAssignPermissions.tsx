import api from "../../lib/axios";

const handleAssignPermissions = async (roleId: string, permissions: string[]) => {
  try {
    const res = await api.post(
      `${import.meta.env.VITE_API_URL}/rbac/assign-permissions`,
      {
        roleId,
        permissions,
      },
    );

    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default handleAssignPermissions;
