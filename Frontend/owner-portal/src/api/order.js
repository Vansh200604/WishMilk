import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const orderApi = {
  create: (payload) => unwrap(axiosClient.post("/orders", payload)),
  myOrders: (params) => unwrap(axiosClient.get("/orders/my-orders", { params })),
  getById: (id) => unwrap(axiosClient.get(`/orders/${id}`)),
  cancel: (id, cancelReason) =>
    unwrap(axiosClient.patch(`/orders/${id}/cancel`, { cancelReason })),
  reschedule: (id, payload) => unwrap(axiosClient.patch(`/orders/${id}/reschedule`, payload)),

  // Dairy owner
  byDairy: (dairyId, params) => unwrap(axiosClient.get(`/orders/dairy/${dairyId}`, { params })),
  updateStatus: (id, payload) => unwrap(axiosClient.patch(`/orders/${id}/status`, payload)),
};