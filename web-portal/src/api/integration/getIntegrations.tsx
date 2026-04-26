import api from "../../lib/axios";

const getIntegrations = async() => {
  try {
    const res = await api.get("/integration")
    return res.data;
  } catch (error) {
    console.error(error);
    return []
  }
}

export default getIntegrations
