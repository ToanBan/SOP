import api from "../../lib/axios"

const updateCustomer = async(customerId:string, email?:string, phone?:string) => {
    try {
        const res = await api.put(`/chat/customer/${customerId}`, { email, phone })
        return { success: true, data: res.data }
    } catch (error) {
        console.error("Error updating customer:", error)
        return { success: false, error: "Failed to update customer" }
    }
}

export default updateCustomer
