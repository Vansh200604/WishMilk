import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const dairyApi = {
  list: (params) => unwrap(axiosClient.get("/dairies", { params })),
  nearby: (params) => unwrap(axiosClient.get("/dairies/nearby", { params })),
  getById: (id) => unwrap(axiosClient.get(`/dairies/${id}`)),

  // Dairy owner
  getMyDairy: () => unwrap(axiosClient.get("/dairies/owner/my-dairy")),
  create: (payload) => unwrap(axiosClient.post("/dairies", payload)),
  update: (id, payload) => unwrap(axiosClient.put(`/dairies/${id}`, payload)),
  toggleStatus: (id) => unwrap(axiosClient.patch(`/dairies/${id}/toggle-status`)),
  updatePricing: (id, milkPricing) => unwrap(axiosClient.patch(`/dairies/${id}/pricing`, { milkPricing })),
  remove: (id) => unwrap(axiosClient.delete(`/dairies/${id}`)),
};4