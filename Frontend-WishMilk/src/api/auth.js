import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const authApi = {
  register: (payload) => unwrap(axiosClient.post("/user/register", payload)),
  login: (payload) => unwrap(axiosClient.post("/user/login", payload)),
  forgotPassword: (email) => unwrap(axiosClient.post("/user/forgot-password", { email })),
  resetPassword: (token, newPassword) =>
    unwrap(axiosClient.post(`/user/reset-password/${token}`, { newPassword })),
  getProfile: () => unwrap(axiosClient.get("/user/profile")),
  updateProfile: (payload) => unwrap(axiosClient.put("/user/profile", payload)),
  becomeDairyOwner: () => unwrap(axiosClient.patch("/user/become-dairy-owner")),
  changePassword: (payload) => unwrap(axiosClient.patch("/user/change-password", payload)),
  deactivate: () => unwrap(axiosClient.patch("/user/deactivate")),

  addAddress: (payload) => unwrap(axiosClient.post("/user/address", payload)),
  getAddresses: () => unwrap(axiosClient.get("/user/address")),
  deleteAddress: (id) => unwrap(axiosClient.delete(`/user/address/${id}`)),
};