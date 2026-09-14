import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.js";
import { TOKEN_KEY, setOnUnauthorized } from "../lib/axiosClient.js";

const AuthContext = createContext(null);

// "Authenticated" here specifically means "logged in AND role is admin" —
// same pattern as the owner/rider portals. No register/upgrade flow at
// all in this app — admin is a security boundary, not a self-serve role.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setInitializing(false);
      return;
    }
    authApi
      .getProfile()
      .then((res) => {
        if (res.data?.role === "admin") {
          setUser(res.data);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setInitializing(false));
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    if (res.user?.role !== "admin") {
      throw new Error("This portal is for admin accounts only.");
    }
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}