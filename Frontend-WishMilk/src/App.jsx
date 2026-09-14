// import { Routes, Route, Outlet } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import Layout from "./components/layout/Layout.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";
// // import OwnerRoute from "./components/OwnerRoute.jsx";
// // import OwnerLayout from "./owner/OwnerLayout.jsx";

// import Home from "./pages/Home.jsx";
// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import ForgotPassword from "./pages/ForgotPassword.jsx";
// import ResetPassword from "./pages/ResetPassword.jsx";
// import Dairies from "./pages/Dairies.jsx";
// import DairyDetail from "./pages/DairyDetail.jsx";
// import Cart from "./pages/Cart.jsx";
// import Checkout from "./pages/Checkout.jsx";
// import Orders from "./pages/Orders.jsx";
// import OrderDetail from "./pages/OrderDetail.jsx";
// import Profile from "./pages/Profile.jsx";
// import Addresses from "./pages/Addresses.jsx";
// import Wallet from "./pages/Wallet.jsx";
// import Subscriptions from "./pages/Subscriptions.jsx";
// import Notifications from "./pages/Notifications.jsx";
// import NotFound from "./pages/NotFound.jsx";

// export default function App() {
//   return (
//     <Layout>
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
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:token" element={<ResetPassword />} />

//         <Route path="/dairies" element={<Dairies />} />
//         <Route path="/dairies/:id" element={<DairyDetail />} />

//         <Route path="/cart" element={<Cart />} />
//         <Route
//           path="/checkout"
//           element={
//             <ProtectedRoute>
//               <Checkout />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/orders"
//           element={
//             <ProtectedRoute>
//               <Orders />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/orders/:id"
//           element={
//             <ProtectedRoute>
//               <OrderDetail />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/addresses"
//           element={
//             <ProtectedRoute>
//               <Addresses />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/wallet"
//           element={
//             <ProtectedRoute>
//               <Wallet />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//             path="/subscriptions"
//             element={
//               <ProtectedRoute>
//                 <Subscriptions />
//               </ProtectedRoute>
//             }
//           />
//         <Route
//           path="/notifications"
//           element={
//             <ProtectedRoute>
//               <Notifications />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </Layout>
//   );
// }








import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dairies from "./pages/Dairies.jsx";
import DairyDetail from "./pages/DairyDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Addresses from "./pages/Addresses.jsx";
import Wallet from "./pages/Wallet.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotFound from "./pages/NotFound.jsx";

// Note: the dairy-owner and delivery-rider experiences used to live here
// as extra route groups, gated by role. They're now fully separate apps
// (wishmilk-owner-portal, wishmilk-delivery-portal) with their own
// deployments — this app only ever needs to link out to them, never
// render them itself. See Navbar.jsx / Profile.jsx for those links.

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
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/dairies" element={<Dairies />} />
          <Route path="/dairies/:id" element={<DairyDetail />} />

          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <Addresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}