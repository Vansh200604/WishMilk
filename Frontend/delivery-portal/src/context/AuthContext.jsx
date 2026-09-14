import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.js";
import { TOKEN_KEY, setOnUnauthorized } from "../lib/axiosClient.js";

const AuthContext = createContext(null);

// "Authenticated" here specifically means "logged in AND role is
// deliveryPerson" — same pattern as the owner portal's AuthContext, just
// for the rider role instead.
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
        if (res.data?.role === "deliveryPerson") {
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
    if (res.user?.role !== "deliveryPerson") {
      throw new Error("This portal is for delivery riders only.");
    }
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  };

  // Creates a brand-new account and immediately links it to the chosen
  // dairy as a rider — one submit instead of register-then-upgrade.

  // const registerAsRider = async (payload, dairyId) => {
  //   const res = await authApi.register(payload);
  //   localStorage.setItem(TOKEN_KEY, res.token);
  //   const upgraded = await authApi.becomeDeliveryPerson(dairyId);
  //   setUser(upgraded.data);
  //   return upgraded.data;
  // };

  const registerAsRider = async (payload) => {
    const res = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, res.token);
    const upgraded = await authApi.becomeDeliveryPerson();
    setUser(upgraded.data);
    return upgraded.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, initializing, login, registerAsRider, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}