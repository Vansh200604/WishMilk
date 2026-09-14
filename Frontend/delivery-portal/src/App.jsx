// import { Routes, Route } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import Layout from "./components/Layout.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";

// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import MyDeliveries from "./pages/MyDeliveries.jsx";
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
//                 <MyDeliveries />
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
import MyDeliveries from "./pages/MyDeliveries.jsx";
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
                <MyDeliveries />
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