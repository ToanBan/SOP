import api from "../../lib/axios";


const getAllCustomer = async() => {
  try {
    const response = await api.get('/chat/allcustomer');
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export default getAllCustomer
