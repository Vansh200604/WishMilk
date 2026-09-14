import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const deliveryApi = {
  byOrder: (orderId) => unwrap(axiosClient.get(`/delivery/order/${orderId}`)),
  create: (payload) => unwrap(axiosClient.post("/delivery", payload)),
  assignRider: (id, riderId) => unwrap(axiosClient.patch(`/delivery/${id}/assign`, { riderId })),
  updateStatus: (id, payload) => unwrap(axiosClient.patch(`/delivery/${id}/status`, payload)),
  updateLocation: (id, coordinates) =>
    unwrap(axiosClient.patch(`/delivery/${id}/location`, { coordinates })),
};