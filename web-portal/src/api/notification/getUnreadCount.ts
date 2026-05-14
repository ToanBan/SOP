import api from "../../lib/axios";

const getUnreadCount = async () => {
  try {
    const res = await api.get("/notification/unread-count");
    return res.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: `Failed ${error}` };
  }
};

export default getUnreadCount;
