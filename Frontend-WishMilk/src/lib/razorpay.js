import { paymentApi } from "../api/payment.js";

// Opens the Razorpay Checkout widget and resolves once payment is verified
// server-side, or rejects with a readable message if it's cancelled/fails.
// Used both for a fresh checkout and for retrying an unpaid order — the
// backend reuses the same Razorpay order in both cases, so this function
// doesn't need to know which one it is.
export function payWithRazorpay({ razorpayOrderId, amount, currency, keyId }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Payment widget didn't load — check your connection and try again."));
      return;
    }
    const rzp = new window.Razorpay({
      key: keyId,
      order_id: razorpayOrderId,
      amount,
      currency,
      name: "WishMilk",
      description: "Milk order payment",
      theme: { color: "#E7A73C" },
      handler: async (response) => {
        try {
          await paymentApi.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });
    rzp.on("payment.failed", () => reject(new Error("Payment failed")));
    rzp.open();
  });
}