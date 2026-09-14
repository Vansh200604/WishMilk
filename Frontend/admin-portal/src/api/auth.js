import axiosClient, { unwrap } from "../lib/axiosClient.js";

// No register/become-admin methods here — deliberately. Admin accounts
// are a real security boundary, unlike dairyOwner/deliveryPerson which
// have self-serve upgrade flows. Creating one requires setting
// role: "admin" directly in the database.
export const authApi = {
  login: (payload) => unwrap(axiosClient.post("/user/login", payload)),
  getProfile: () => unwrap(axiosClient.get("/user/profile")),
};