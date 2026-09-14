import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const reviewApi = {
  forDairy: (dairyId) => unwrap(axiosClient.get(`/reviews/${dairyId}`)),
  summary: (dairyId) => unwrap(axiosClient.get(`/reviews/${dairyId}/summary`)),
  myReviews: () => unwrap(axiosClient.get("/reviews/user/my-reviews")),
  create: (dairyId, payload) => unwrap(axiosClient.post(`/reviews/${dairyId}`, payload)),
  update: (reviewId, payload) => unwrap(axiosClient.put(`/reviews/${reviewId}`, payload)),
  remove: (reviewId) => unwrap(axiosClient.delete(`/reviews/${reviewId}`)),
};