import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.js";
import { TOKEN_KEY, setOnUnauthorized } from "../lib/axiosClient.js";

const AuthContext = createContext(null);

// This whole app is the owner portal, so "authenticated" here specifically
// means "logged in AND role is dairyOwner" — a customer or rider account
// that logs in successfully still gets treated as unauthenticated here.
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
        if (res.data?.role === "dairyOwner") {
          setUser(res.data);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      // .catch(() => localStorage.removeItem(TOKEN_KEY))
      .catch((err) => {
          if (err.response?.status === 401) {
              localStorage.removeItem(TOKEN_KEY);
          } else {
              console.error(err);
          }
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = async (payload) => {
    const res = await authApi.login(payload);
    if (res.user?.role !== "dairyOwner") {
      throw new Error("This portal is for dairy owner accounts only.");
    }
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  };

  // Creates a brand-new account and immediately upgrades it to dairyOwner —
  // one submit instead of register-then-separately-upgrade.
  const registerAsDairyOwner = async (payload) => {
    const res = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, res.token);
    const upgraded = await authApi.becomeDairyOwner();
    setUser(upgraded.data);
    return upgraded.data;
  };

  const refreshProfile = async () => {
    const res = await authApi.getProfile();
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initializing,
        login,
        registerAsDairyOwner,
        logout,
        refreshProfile,
      }}
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