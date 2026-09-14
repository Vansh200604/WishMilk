import axiosClient, { unwrap } from "../lib/axiosClient.js";

// Only what the rider registration flow needs — a list to pick which
// dairy to ride for. No owner-side methods here at all.
export const dairyApi = {
  list: (params) => unwrap(axiosClient.get("/dairies", { params })),
  nearby: (params) => unwrap(axiosClient.get("/dairies/nearby", { params })),
};