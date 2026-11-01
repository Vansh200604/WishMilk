import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const earningsApi = {
  getPlatform: () => unwrap(axiosClient.get("/earnings/platform")),
  getPayouts: (params) => unwrap(axiosClient.get("/earnings/payouts", { params })),
  updatePayout: (id, payload) => unwrap(axiosClient.patch(`/earnings/payouts/${id}`, payload)),
};