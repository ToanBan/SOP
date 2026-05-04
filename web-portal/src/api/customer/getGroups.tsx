import api from "../../lib/axios"

const getGroups = async() => {
  try {
    const res = await api.get("/chat/group")
    return res.data
  } catch (error) {
    console.error([])
  }
}

export default getGroups
