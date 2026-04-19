import api from "../../lib/axios";
const handleLogin = async (email: string, password: string) => {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export default handleLogin;
