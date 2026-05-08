import api from "../../lib/axios"

const handleConnectionFB = async(accessToken:string, pageId:string) => {
  try {
    const res = await api.post("/integration/facebook/connect", {
      accessToken, 
      pageId
    })
    return res.data
  } catch (error) {
    console.error(error);
    return {success:false, message:`Failed ${error}`}
  }
}

export default handleConnectionFB
