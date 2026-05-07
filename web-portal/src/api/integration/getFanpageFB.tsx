import api from "../../lib/axios";

const getFanpageFB = async(accessToken:string) => {
    try {
        const res = await api.post("/integration/facebook/pages", {accessToken})
        return res.data
    } catch (error) {
        console.error(error);
        return {success:false, message:`failed ${error}`}
    }
}

export default getFanpageFB
