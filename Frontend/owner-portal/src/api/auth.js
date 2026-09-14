// import axiosClient, { unwrap } from "../lib/axiosClient.js";

// export const authApi = {
//   register: (payload) => unwrap(axiosClient.post("/user/register", payload)),
//   login: (payload) => unwrap(axiosClient.post("/user/login", payload)),
//   getProfile: () => unwrap(axiosClient.get("/user/profile")),
//   becomeDairyOwner: () => unwrap(axiosClient.patch("/user/become-dairy-owner")),
//   getRidersForDairy: (dairyId) => unwrap(axiosClient.get(`/user/riders/${dairyId}`)),
// };


import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const authApi = {
  register: (payload) => unwrap(axiosClient.post("/user/register", payload)),
  login: (payload) => unwrap(axiosClient.post("/user/login", payload)),
  getProfile: () => unwrap(axiosClient.get("/user/profile")),
  becomeDairyOwner: () => unwrap(axiosClient.patch("/user/become-dairy-owner")),
  getRidersForDairy: (dairyId) => unwrap(axiosClient.get(`/user/riders/${dairyId}`)),
  getPendingRiders: () => unwrap(axiosClient.get("/user/riders/pending")),
  approveRider: (riderId) => unwrap(axiosClient.patch(`/user/riders/${riderId}/approve`)),
  rejectRider: (riderId) => unwrap(axiosClient.patch(`/user/riders/${riderId}/reject`)),
};