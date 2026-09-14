import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

// No "register" link here at all — admin accounts aren't self-serve.
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex animate-fade-in-up flex-col items-center text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-butter text-ink-fixed">
          <ShieldCheck size={20} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Admin portal</h1>
        <p className="mt-1 text-sm text-ink-soft">Platform oversight — admin accounts only.</p>
      </div>

      <Card className="animate-fade-in-up stagger-1 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Log in
          </Button>
        </form>
      </Card>
    </div>
  );
}