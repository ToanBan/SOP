import { createContext, useContext, useState, useEffect } from "react";
import api, {setIsLoggingOut} from "../lib/axios";
import { setAccessToken } from "./tokenStore";

interface AuthContextType {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  getProfile: () => Promise<any>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const getProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.accessToken;
    console.log(res.data);
    setAccessTokenState(token);
    setAccessToken(token);
    
    const profile = await getProfile();
    return { token, profile };
  };

  const logout = async () => {
    try {
       setIsLoggingOut(true);
      await api.post("/auth/logout");
    } finally {
      setAccessTokenState(null);
      setAccessToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {   
        const res = await api.post("/auth/refresh-token"); 
        const newToken = res.data.accessToken
        setAccessToken(newToken);
        setAccessTokenState(newToken);

        await getProfile(); 
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }; 

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, getProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
};