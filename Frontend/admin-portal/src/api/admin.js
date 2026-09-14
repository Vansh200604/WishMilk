import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const adminApi = {
  getStats: () => unwrap(axiosClient.get("/admin/stats")),
  getUsers: (params) => unwrap(axiosClient.get("/admin/users", { params })),
  updateUserStatus: (id, isActive) =>
    unwrap(axiosClient.patch(`/admin/users/${id}/status`, { isActive })),
  getDairies: (params) => unwrap(axiosClient.get("/admin/dairies", { params })),
  getOrders: (params) => unwrap(axiosClient.get("/admin/orders", { params })),
  getSubscriptions: (params) => unwrap(axiosClient.get("/admin/subscriptions", { params })),
};