import api from "../../lib/axios"

const readNotification = async(notificationId:string) => {
    try {
        const res = await api.post('/notification/read', {notificationId})
        return res.data;
    } catch (error) {
        console.error(error);
        return {success:false, message:`Failed ${error}`}
    }
}

export default readNotification
