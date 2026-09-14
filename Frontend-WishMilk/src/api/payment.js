import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const paymentApi = {
  // paymentMethod: 'cash_on_delivery' short-circuits to a COD payment record
  // on the backend; any other value creates a real Razorpay order.
  createOrder: (payload) => unwrap(axiosClient.post("/payments/create-order", payload)),
  verify: (payload) => unwrap(axiosClient.post("/payments/verify", payload)),
  myPayments: (params) => unwrap(axiosClient.get("/payments/my-payments", { params })),
  getByOrder: (orderId) => unwrap(axiosClient.get(`/payments/order/${orderId}`)),
  refund: (paymentId, amount) => unwrap(axiosClient.post(`/payments/${paymentId}/refund`, { amount })),
};