// import axiosClient, { unwrap } from "../lib/axiosClient.js";

// export const authApi = {
//   register: (payload) => unwrap(axiosClient.post("/user/register", payload)),
//   login: (payload) => unwrap(axiosClient.post("/user/login", payload)),
//   getProfile: () => unwrap(axiosClient.get("/user/profile")),
//   becomeDeliveryPerson: (dairyId) =>
//     unwrap(axiosClient.patch("/user/become-delivery-person", { dairyId })),
//     // Rider's own general position — separate from a specific delivery's
//   // live-tracking location. This is what nearest-rider matching uses.
//   updateMyLocation: (coordinates) => unwrap(axiosClient.patch("/user/location", { coordinates })),
// };



import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const authApi = {
  register: (payload) => unwrap(axiosClient.post("/user/register", payload)),
  login: (payload) => unwrap(axiosClient.post("/user/login", payload)),
  getProfile: () => unwrap(axiosClient.get("/user/profile")),
  becomeDeliveryPerson: () => unwrap(axiosClient.patch("/user/become-delivery-person")),
  // Rider's own general position — separate from a specific delivery's
  // live-tracking location. This is what nearest-rider matching uses.
  updateMyLocation: (coordinates) => unwrap(axiosClient.patch("/user/location", { coordinates })),
  goOffline: () => unwrap(axiosClient.patch("/user/go-offline")),
};





