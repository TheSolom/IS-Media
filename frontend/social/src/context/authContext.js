import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { makeRequest } from "../axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  const login = useCallback(async (inputs) => {
    const loginRes = await makeRequest.post("auth/login", inputs);

    if (!loginRes.data.success) {
      throw new Error(loginRes.data.message || "Login failed");
    }

    const userId = loginRes.data.user?.id || loginRes.data.userId;

    const userRes = await makeRequest.get(`users/${userId}/profile`);

    if (!userRes.data.success) {
      throw new Error(userRes.data.message || "Failed to fetch user profile");
    }

    setCurrentUser(userRes.data.user);
  }, []);

  const guestLogin = useCallback(async () => {
    const loginRes = await makeRequest.post("auth/guest-login", {});

    if (!loginRes.data.success) {
      throw new Error(loginRes.data.message || "Guest login failed");
    }

    const userId = loginRes.data.user?.id || loginRes.data.userId;

    const userRes = await makeRequest.get(`users/${userId}/profile`);

    if (!userRes.data.success) {
      throw new Error(userRes.data.message || "Failed to fetch user profile");
    }

    setCurrentUser(userRes.data.user);
  }, []);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  const value = useMemo(
    () => ({ currentUser, login, guestLogin }),
    [currentUser, login, guestLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
