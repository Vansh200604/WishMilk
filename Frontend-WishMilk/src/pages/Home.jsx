import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck, Truck } from "lucide-react";
import { dairyApi } from "../api/dairy.js";
import PourWave from "../components/ui/PourWave.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import DairyCard from "../components/dairy/DairyCard.jsx";
import { MILK_TYPE_LABEL } from "../lib/utils.js";
import { useAuth } from "../context/AuthContext.jsx";
import getGreeting from "../hooks/greetingHome.js";

const perks = [
  { icon: Clock, title: "Before-breakfast delivery", text: "Daily slots from 6–9 AM, timed to your morning." },
  { icon: ShieldCheck, title: "Verified local dairies", text: "Every dairy is reviewed and rated by real households." },
  { icon: Truck, title: "Live delivery tracking", text: "Watch your order move from dairy to doorstep." },
];

export default function Home() {
  const [dairies, setDairies] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user, isAuthenticated} = useAuth();

  const greeting = getGreeting();

  useEffect(() => {
    dairyApi
      .list({})
      .then((res) => setDairies((res.data || []).slice(0, 3)))
      .catch(() => setDairies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream-soft to-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-14 md:grid-cols-2 md:pt-24">
          <div>
            
            <span className="inline-block rounded-full bg-butter-light/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-butter-dark">
              {greeting.title},
            </span>

            <div>
              <span className="*inline-block rounded-full bg-butter-light/60 px-3 py-1 mt-2 text-xs font-semibold uppercase tracking-wide text-butter-dark">
                {greeting.subtitle}
              </span>
            </div>
            
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-ink md:text-5xl">
              Milk from a dairy your neighbours already trust.
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-soft">
              Order cow, buffalo, goat or sheep milk from verified local dairies, scheduled
              for a slot that fits your morning — one tap, no queue.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button as={Link} to="/dairies" size="lg">
                Browse dairies near you <ArrowRight size={18} />
              </Button>
              {!isAuthenticated && (
                <Button as={Link} to="/register" variant="outline" size="lg">
                  Create an account
                </Button>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {Object.entries(MILK_TYPE_LABEL).map(([type, label]) => (
                <Link
                  key={type}
                  to={`/dairies?milkType=${type}`}
                  className="rounded-full border border-ink/12 bg-cream-card px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:border-butter hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-butter-light/40 blur-2xl" />
            <Card className="p-6">
              <div className="cream-top" />
              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Tomorrow's delivery
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">Full-cream cow milk</p>
                  <p className="text-sm text-ink-soft">2 litres · Morning slot</p>
                </div>
                <span className="rounded-full bg-leaf-light px-3 py-1 text-xs font-semibold text-leaf">
                  Confirmed
                </span>
              </div>
              <div className="mt-5 rounded-xl bg-cream-soft px-4 py-3 text-sm text-ink-soft">
                "Same dairy for two years now — the app just makes ordering effortless."
              </div>
            </Card>
          </div>
        </div>
      </section>
      <PourWave className="h-10" />

      {/* Perks */}
      <section className="bg-cream-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-dawn-light/50 text-dawn-dark">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top dairies */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Top-rated dairies</h2>
            <p className="mt-1 text-sm text-ink-soft">Highest rated by households like yours.</p>
          </div>
          <Link to="/dairies" className="hidden text-sm font-medium text-dawn-dark hover:underline md:block">
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : dairies.length === 0 ? (
          <p className="mt-8 text-sm text-ink-soft">
            No dairies are registered yet — check back soon.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {dairies.map((d) => (
              <DairyCard key={d._id} dairy={d} />
            ))}
          </div>
        )}

        <div className="mt-6 md:hidden">
          <Button as={Link} to="/dairies" variant="outline" className="w-full">
            View all dairies
          </Button>
        </div>
      </section>
    </div>
  );
}