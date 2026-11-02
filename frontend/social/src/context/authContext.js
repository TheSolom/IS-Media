import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    const loginRes = await axios.post("http://localhost:5000/api/v1/auth/login", inputs, {
      withCredentials: true,
    });

    if (!loginRes.data.success) {
      throw new Error(loginRes.data.message || 'Login failed');
    }

    const userId = loginRes.data.user?.id || loginRes.data.userId;

    const userRes = await axios.get(`http://localhost:5000/api/v1/users/${userId}/profile`, {
      withCredentials: true,
    });

    if (!userRes.data.success) {
      throw new Error(userRes.data.message || 'Failed to fetch user profile');
    }

    setCurrentUser(userRes.data.user);
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};
