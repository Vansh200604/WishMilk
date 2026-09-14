import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const couponApi = {
  apply: (payload) => unwrap(axiosClient.post("/coupons/apply", payload)),
  redeem: (payload) => unwrap(axiosClient.post("/coupons/redeem", payload)),
};