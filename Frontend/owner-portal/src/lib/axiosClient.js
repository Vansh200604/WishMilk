import axios from "axios";

// A distinct storage key from the customer app — these are separate
// deployable apps, so sessions must not collide even if somehow opened
// on the same device/browser.
export const TOKEN_KEY = "wishmilk_owner_token";

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

// Every backend response is { success, message, data? }.
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