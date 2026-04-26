import api from "../../lib/axios"

const getStatis = async() => {
  try {
    const res = await api.get("/integration/statis")
    return res.data;
  } catch (error) {
    console.error(error);
    return {success:false, message:"failed"}
  }
}

export default getStatis
