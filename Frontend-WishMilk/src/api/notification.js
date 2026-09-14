import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const notificationApi = {
  list: (params) => unwrap(axiosClient.get("/notifications", { params })),
  markRead: (id) => unwrap(axiosClient.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(axiosClient.patch("/notifications/read-all")),
  remove: (id) => unwrap(axiosClient.delete(`/notifications/${id}`)),
};