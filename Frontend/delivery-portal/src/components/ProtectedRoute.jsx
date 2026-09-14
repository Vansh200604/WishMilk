import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./ui/Spinner.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <Spinner label="Checking your session" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}