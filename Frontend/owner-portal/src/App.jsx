// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import Layout from "./components/Layout.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";

// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import OwnerDashboard from "./pages/OwnerDashboard.jsx";
// import OwnerDairyProfile from "./pages/OwnerDairyProfile.jsx";
// import OwnerMilk from "./pages/OwnerMilk.jsx";
// import OwnerOrders from "./pages/OwnerOrders.jsx";
// import NotFound from "./pages/NotFound.jsx";

// export default function App() {
//   return (
//     <>
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           style: {
//             background: "#22303B",
//             color: "#FBF6EC",
//             fontSize: "14px",
//             borderRadius: "12px",
//           },
//         }}
//       />
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <OwnerDashboard />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/dairy"
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <OwnerDairyProfile />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/milk"
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <OwnerMilk />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/orders"
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <OwnerOrders />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />

//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </>
//   );
// }






import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import OwnerDairyProfile from "./pages/OwnerDairyProfile.jsx";
import OwnerMilk from "./pages/OwnerMilk.jsx";
import OwnerOrders from "./pages/OwnerOrders.jsx";
import PendingRiders from "./pages/PendingRiders.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#22303B",
            color: "#FBF6EC",
            fontSize: "14px",
            borderRadius: "12px",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <OwnerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dairy"
          element={
            <ProtectedRoute>
              <Layout>
                <OwnerDairyProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/milk"
          element={
            <ProtectedRoute>
              <Layout>
                <OwnerMilk />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <OwnerOrders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/riders"
          element={
            <ProtectedRoute>
              <Layout>
                <PendingRiders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}