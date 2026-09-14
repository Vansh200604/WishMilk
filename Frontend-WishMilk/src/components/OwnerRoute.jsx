import { Navigate, useLocation, Link } from "react-router-dom";
import { Milk } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./ui/Spinner.jsx";
import Button from "./ui/Button.jsx";

export default function OwnerRoute({ children }) {
  const { isAuthenticated, initializing, user } = useAuth();
  const location = useLocation();

  if (initializing) return <Spinner label="Checking your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "dairyOwner") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-butter-light/60 text-butter-dark">
          <Milk size={22} />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink">Owner access only</h1>
        <p className="mt-2 text-sm text-ink-soft">
          This section is for registered dairy owner accounts. If you run a dairy and think
          this is a mistake, reach out to support to have your account upgraded.
        </p>
        <Button as={Link} to="/" className="mt-6">
          Back to WishMilk
        </Button>
      </div>
    );
  }

  return children;
}