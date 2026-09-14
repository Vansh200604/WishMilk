import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const walletApi = {
  get: () => unwrap(axiosClient.get("/wallet")),
  transactions: (params) => unwrap(axiosClient.get("/wallet/transactions", { params })),
  addMoney: (amount) => unwrap(axiosClient.post("/wallet/add-money", { amount })),
  redeemPoints: (points) => unwrap(axiosClient.post("/wallet/redeem-points", { points })),
};
