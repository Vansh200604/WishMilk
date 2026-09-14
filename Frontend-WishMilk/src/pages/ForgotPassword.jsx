import { useState } from "react";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";
import { authApi } from "../api/auth.js";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
          <Milk size={20} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-soft">
          We'll email you a link to set a new one.
        </p>
      </div>

      <Card className="p-6">
        {sent ? (
          <p className="text-sm text-ink-soft">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
            Check your inbox and follow the link to continue.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-sm text-clay">{error}</p>}
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-medium text-dawn-dark hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}