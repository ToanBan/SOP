import api from "../../lib/axios";

const handleRegister = async (
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
) => {
  try {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
      confirmPassword,
    });
    return res.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export default handleRegister;
