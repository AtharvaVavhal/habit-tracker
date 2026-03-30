import { useEffect } from "react";
import "./LandingPage.css";

const APP_URL = "/app";

/* Scroll reveal — fires once per element, spring easing via CSS */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal--visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <p className="hero__eyebrow hero--enter-1">Daily habits. Weekly goals.</p>
        <h1 className="hero__title hero--enter-2">
          The habit tracker<br />that stays honest.
        </h1>
        <p className="hero__subtitle hero--enter-3">
          Accurate streaks, real completion rates, and instant feedback —
          built for people who want clarity, not motivation theater.
        </p>
        <div className="hero__actions hero--enter-4">
          <a href={APP_URL} className="btn-primary">Open App</a>
          <a href="#features" className="btn-ghost">See features ↓</a>
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  {
    icon: "◎",
    title: "Daily & weekly cadence",
    body: "Create habits on any schedule. Daily habits track consecutive days; weekly habits track ISO weeks — each measured from its own creation date.",
  },
  {
    icon: "◈",
    title: "Honest stats",
    body: "Completion rate uses your actual creation date as the denominator. No flattering math, no inflated numbers.",
  },
  {
    icon: "⟳",
    title: "Instant response",
    body: "Optimistic UI updates the screen before the server responds. If the API fails, it rolls back silently.",
  },
  {
    icon: "◉",
    title: "Persistent history",
    body: "Everything lives server-side. Your streaks and history survive tab closes, page reloads, and new devices.",
  },
];

function Features() {
  return (
    <section className="section" id="features">
      <div className="section__inner">
        <div className="section__label reveal">Features</div>
        <h2 className="section__title reveal">Built to be accurate,<br />not just pretty.</h2>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div
              className="feature-card reveal"
              key={i}
              style={{ "--delay": `${i * 70}ms` }}
            >
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
const STEPS = [
  {
    num: "1",
    title: "Create a habit",
    body: "Give it a name. Choose daily or weekly. Done in five seconds.",
  },
  {
    num: "2",
    title: "Mark it complete",
    body: "One click. The app updates instantly. No loading spinners.",
  },
  {
    num: "3",
    title: "Read your stats",
    body: "Current streak, longest streak, 7-day view, completion rate. All real numbers.",
  },
];

function HowItWorks() {
  return (
    <section className="section section--alt">
      <div className="section__inner">
        <div className="section__label reveal">How it works</div>
        <h2 className="section__title reveal">Three steps.<br />No friction.</h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div
              className="step reveal"
              key={i}
              style={{ "--delay": `${i * 90}ms` }}
            >
              <div className="step__num">{s.num}</div>
              <div className="step__content">
                <h3 className="step__title">{s.title}</h3>
                <p className="step__body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA band ── */
function CTABand() {
  return (
    <section className="cta-band">
      <div className="cta-band__inner reveal">
        <h2 className="cta-band__title">Start tracking today.</h2>
        <a href={APP_URL} className="btn-primary btn-primary--large">
          Open App
        </a>
      </div>
    </section>
  );
}

/* ── Tech ── */
function TechStack() {
  return (
    <section className="section">
      <div className="section__inner">
        <div className="tech reveal">
          <span className="tech__label">Built with</span>
          {["Flask", "React", "SQLite", "Optimistic UI", "Async-safe state"].map((t) => (
            <span className="tech__pill" key={t}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">Habit Tracker</span>
        <span className="footer__dot">·</span>
        <span className="footer__note">Flask + React · Railway + Vercel</span>
      </div>
    </footer>
  );
}

/* ── Root ── */
function LandingPage() {
  useScrollReveal();
  return (
    <div className="landing">
      <Hero />
      <Features />
      <HowItWorks />
      <CTABand />
      <TechStack />
      <Footer />
    </div>
  );
}

export default LandingPage;
