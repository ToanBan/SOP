import api from "../../lib/axios";
const handleConnectionDiscord = async (botToken: string) => {
  try {
    const res = await api.post("/integration/discord/connect", {
      botToken
    });
    return res.data;
  } catch (error) {
    console.error("Error handling connection:", error);
    return { success: false, error: "Failed to handle connection" };
  }
};

export default handleConnectionDiscord;
