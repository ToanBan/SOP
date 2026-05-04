import api from "../../lib/axios";

const createCampaign = async (
  content: string,
  conversationIds: string[],
  endDate: string,
  files?: File[],
) => {
  try {
    const formData = new FormData();
    formData.append("content", content);

    formData.append("scheduledAt", endDate);

    if (conversationIds && conversationIds.length > 0) {
      conversationIds.forEach((id) => {
        formData.append("conversationIds[]", id);
      });
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    const res = await api.post("/marketing/create", formData);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default createCampaign;
