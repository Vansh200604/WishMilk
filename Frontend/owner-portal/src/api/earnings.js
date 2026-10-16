import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const earningsApi = {
  getMine: (year) => unwrap(axiosClient.get("/earnings/owner", { params: { year } })),
  getActivity: (year) => unwrap(axiosClient.get("/dairies/owner/my-activity", { params: { year } })),
  requestPayout: (payload) => unwrap(axiosClient.post("/earnings/payouts", payload)),
  getMyPayouts: () => unwrap(axiosClient.get("/earnings/payouts/my")),
};