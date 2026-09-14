import axiosClient, { unwrap } from "../lib/axiosClient.js";
 
export const subscriptionApi = {
  create: (payload) => unwrap(axiosClient.post("/subscriptions", payload)),
  myList: (params) => unwrap(axiosClient.get("/subscriptions/my-subscriptions", { params })),
  getById: (id) => unwrap(axiosClient.get(`/subscriptions/${id}`)),
  pause: (id) => unwrap(axiosClient.patch(`/subscriptions/${id}/pause`)),
  resume: (id) => unwrap(axiosClient.patch(`/subscriptions/${id}/resume`)),
  cancel: (id) => unwrap(axiosClient.patch(`/subscriptions/${id}/cancel`)),
};
 