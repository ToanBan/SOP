import api from "../../lib/axios";

const handleConnection = async (botToken:string) => {
  try {
    const res = await api.post("/integration/telegram/connect", {botToken, integrationId:"a1b2c3d4-e5f6-7890-1234-56789abcdef0"});
    return res.data;
  } catch (error) {
    console.error("Error handling connection:", error);
    return { success: false, error: "Failed to handle connection" };
  }
};

export default handleConnection;
