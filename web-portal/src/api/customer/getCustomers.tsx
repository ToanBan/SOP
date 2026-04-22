import api from "../../lib/axios";


const getCustomers = async() => {
  try {
    const response = await api.get('/chat/customers');
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export default getCustomers
