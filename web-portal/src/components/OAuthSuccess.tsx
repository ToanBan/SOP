import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { setAccessToken } from "../context/tokenStore";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        const res = await api.post("/auth/refresh-token");
        const token = res.data.accessToken;
        console.log("OAuth token:", token);
        setAccessToken(token);
        navigate("/dashboard");
      } catch (err) {
        console.error("OAuth failed", err);
        // navigate("/login");
      }
    };

    handleOAuth();
  }, []);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;