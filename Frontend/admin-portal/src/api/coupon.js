import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const couponApi = {
  list: (params) => unwrap(axiosClient.get("/coupons", { params })),
  create: (payload) => unwrap(axiosClient.post("/coupons", payload)),
  toggle: (id) => unwrap(axiosClient.patch(`/coupons/${id}/toggle`)),
  remove: (id) => unwrap(axiosClient.delete(`/coupons/${id}`)),
};