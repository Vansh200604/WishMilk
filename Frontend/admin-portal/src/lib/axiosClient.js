import axios from "axios";

// Distinct storage key — separate deployable app, own session, doesn't
// collide with the customer, owner, or rider apps if open in the same
// browser.
export const TOKEN_KEY = "wishmilk_admin_token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = () => {};
export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn;
};

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const unwrap = async (promise) => {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    throw new Error(message);
  }
};

export default axiosClient;