import { useEffect } from "react";
import "./LandingPage.css";

const APP_URL = "/app";

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <p className="hero__eyebrow">Habit Tracker</p>
        <h1 className="hero__title">
          Build habits that<br />actually stick.
        </h1>
        <p className="hero__subtitle">
          Track daily and weekly habits, watch your streaks grow,
          and understand your consistency — all in one minimal app.
        </p>
        <a href={APP_URL} className="btn-primary">
          Open App
        </a>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "Daily & weekly tracking",
    body: "Create habits on any cadence. Daily habits track consecutive days; weekly habits track ISO weeks — each measured correctly.",
  },
  {
    title: "Accurate stats",
    body: "Streaks, completion rates, and 7-day history calculated per habit, from its exact creation date. No inflated numbers.",
  },
  {
    title: "Instant updates",
    body: "Optimistic UI means the app responds immediately on every action. If the server disagrees, it rolls back silently.",
  },
  {
    title: "Persistent data",
    body: "Everything is stored server-side and survives page reloads, new devices, and browser restarts.",
  },
];

function Features() {
  return (
    <section className="section features">
      <div className="section__inner">
        <div className="section__header reveal">
          <h2 className="section__title">Everything you need.</h2>
          <p className="section__subtitle">Nothing you don't.</p>
        </div>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card reveal" key={i} style={{ "--delay": `${i * 80}ms` }}>
              <div className="feature-card__index">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { step: "01", title: "Create", body: "Name your habit and choose daily or weekly." },
  { step: "02", title: "Complete", body: "Mark it done each day or week with one click." },
  { step: "03", title: "Track", body: "Watch streaks grow and completion rates rise." },
];

function HowItWorks() {
  return (
    <section className="section how">
      <div className="section__inner">
        <div className="section__header reveal">
          <h2 className="section__title">How it works.</h2>
        </div>
        <div className="how__steps">
          {STEPS.map((s, i) => (
            <div className="how__step reveal" key={i} style={{ "--delay": `${i * 100}ms` }}>
              <span className="how__step-number">{s.step}</span>
              <div className="how__step-content">
                <h3 className="how__step-title">{s.title}</h3>
                <p className="how__step-body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="section tech">
      <div className="section__inner">
        <div className="tech__inner reveal">
          <p className="tech__label">Built with</p>
          <div className="tech__pills">
            {["Flask", "React", "SQLite", "Optimistic UI", "Async-safe state"].map((t) => (
              <span className="tech__pill" key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__name">Habit Tracker</span>
        <span className="footer__sep">·</span>
        <span className="footer__note">Flask + React</span>
      </div>
    </footer>
  );
}

function LandingPage() {
  useScrollReveal();
  return (
    <div className="landing">
      <Hero />
      <Features />
      <HowItWorks />
      <TechStack />
      <Footer />
    </div>
  );
}

export default LandingPage;
