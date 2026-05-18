import Image from "next/image";
import Link from "next/link";
import { FaRocket, FaShieldAlt, FaChartLine, FaWallet } from "react-icons/fa";
import List from "./List";
import bg from "../assets/bg3.png";

const FEATURES = [
  {
    icon: FaShieldAlt,
    title: "Bank-Grade Security",
    desc: "Your assets are protected by strong encryption and cold-storage protocols.",
    tint: "text-primary",
  },
  {
    icon: FaChartLine,
    title: "Real-Time Analytics",
    desc: "Make informed decisions with low-latency data and advanced charting.",
    tint: "text-accent",
  },
  {
    icon: FaWallet,
    title: "Smart Portfolio",
    desc: "Track profit and loss across all holdings in one unified dashboard.",
    tint: "text-success",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-dvh flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-accent/15 rounded-full blur-[150px] animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-center lg:text-left space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              The Future of Crypto Trading
            </div>

            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight text-foreground">
              Master Your
              <br />
              <span className="text-gradient text-shadow-glow">Digital Wealth</span>
            </h1>

            <p className="text-muted text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Institutional-grade portfolio management with real-time analytics,
              secure execution, and a workflow built for clarity.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link href="/market" className="btn-primary px-8 py-4 text-base group">
                Start Trading Now
                <FaRocket
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/market"
                className="btn-secondary px-8 py-4 text-base"
              >
                <FaChartLine aria-hidden="true" />
                View Live Markets
              </Link>
            </div>

            <dl className="pt-8 flex justify-center lg:justify-start gap-12 border-t border-border mt-8">
              {[
                ["20K+", "Assets"],
                ["$50M+", "Volume"],
                ["0.1s", "Latency"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="sr-only">{k}</dt>
                  <dd className="text-3xl font-bold text-foreground tabular-nums">
                    {v}
                  </dd>
                  <p className="text-sm text-muted uppercase tracking-wider">{k}</p>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 animate-float">
              <Image
                src={bg}
                alt="CryptoFolio portfolio dashboard preview"
                priority
                placeholder="blur"
                className="w-full max-w-2xl h-auto mx-auto drop-shadow-[0_0_50px_hsl(var(--primary)/0.25)]"
              />

              <div
                className="absolute -top-10 -right-10 glass-card p-4 flex items-center gap-4 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 grid place-items-center text-white font-bold">
                  ₿
                </div>
                <div>
                  <div className="text-xs text-muted">Bitcoin</div>
                  <div className="text-sm font-bold text-success">+5.24%</div>
                </div>
              </div>

              <div
                className="absolute -bottom-10 -left-10 glass-card p-4 flex items-center gap-4 animate-float"
                style={{ animationDelay: "2.5s" }}
              >
                <div className="w-10 h-10 rounded-full bg-primary grid place-items-center text-white font-bold">
                  Ξ
                </div>
                <div>
                  <div className="text-xs text-muted">Ethereum</div>
                  <div className="text-sm font-bold text-success">+2.18%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Why Choose <span className="text-gradient">CryptoFolio?</span>
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Built for beginners and professionals alike — the tools you need
              to trade with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc, tint }) => (
              <div
                key={title}
                className="glass-card-hover p-8 group hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-surface-2 grid place-items-center mb-6 text-2xl ${tint} group-hover:scale-110 transition-transform`}
                >
                  <Icon aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
                <p className="text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Trends */}
      <section className="max-w-7xl mx-auto px-6 pb-32 w-full">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
              <div>
                <h3 className="text-3xl font-bold flex items-center gap-3 text-foreground">
                  <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-accent"></span>
                  Market Trends
                </h3>
                <p className="text-muted mt-2">Top performers right now</p>
              </div>
              <Link
                href="/market"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
              >
                View All Markets →
              </Link>
            </div>
            <List />
          </div>
        </div>
      </section>
    </div>
  );
}
