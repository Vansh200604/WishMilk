import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./ui/Spinner.jsx";

// AuthContext only ever sets `user` when role === 'dairyOwner' (see
// AuthContext.jsx), so isAuthenticated here already implies "valid owner
// account" — no separate role check needed at this layer.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <Spinner label="Checking your session" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}