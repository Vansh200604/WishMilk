import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const milkApi = {
  list: (params) => unwrap(axiosClient.get("/milk", { params })),
  getById: (id) => unwrap(axiosClient.get(`/milk/${id}`)),
  byDairy: (dairyId) => unwrap(axiosClient.get(`/milk/dairy/${dairyId}`)),

  // Dairy owner
  create: (payload) => unwrap(axiosClient.post("/milk", payload)),
  update: (id, payload) => unwrap(axiosClient.put(`/milk/${id}`, payload)),
  toggleStock: (id) => unwrap(axiosClient.patch(`/milk/${id}/toggle-stock`)),
  remove: (id) => unwrap(axiosClient.delete(`/milk/${id}`)),
};