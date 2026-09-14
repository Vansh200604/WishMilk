// import axiosClient, { unwrap } from "../lib/axiosClient.js";

// export const deliveryApi = {
//   myDeliveries: (params) => unwrap(axiosClient.get("/delivery/my-deliveries", { params })),
//   updateStatus: (id, payload) => unwrap(axiosClient.patch(`/delivery/${id}/status`, payload)),
//   updateLocation: (id, coordinates) =>
//     unwrap(axiosClient.patch(`/delivery/${id}/location`, { coordinates })),
// };

import axiosClient, { unwrap } from "../lib/axiosClient.js";

export const deliveryApi = {
  myDeliveries: (params) => unwrap(axiosClient.get("/delivery/my-deliveries", { params })),
  updateStatus: (id, payload) => unwrap(axiosClient.patch(`/delivery/${id}/status`, payload)),
  updateLocation: (id, coordinates) =>
    unwrap(axiosClient.patch(`/delivery/${id}/location`, { coordinates })),
  confirm: (id) => unwrap(axiosClient.patch(`/delivery/${id}/confirm`)),
  decline: (id) => unwrap(axiosClient.patch(`/delivery/${id}/decline`)),
};