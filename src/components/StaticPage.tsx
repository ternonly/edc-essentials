import { createFileRoute } from "@tanstack/react-router";

function makePage(title: string, intro: string, body: React.ReactNode) {
  return function Page() {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px" }}>
        <span className="s72-kicker" style={{ color: "#C9A96E" }}>Survival72</span>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "12px 0 18px", letterSpacing: "-0.5px" }}>
          {title}
        </h1>
        <p style={{ color: "#666", fontSize: 17, lineHeight: 1.7, marginBottom: 28 }}>{intro}</p>
        <div style={{ color: "#333", fontSize: 15, lineHeight: 1.8 }}>{body}</div>
      </div>
    );
  };
}

export const About = makePage(
  "About Survival72",
  "Survival72™ exists for the 72 hours that matter most — the gap between the moment something goes wrong and the moment you reach safety.",
  <>
    <p>
      We build modular tools for everyday carry, designed to be genuinely useful in the GCC and
      the wider Middle East. Industrial luxury aesthetic, professional-grade materials, and a
      no-nonsense product roadmap.
    </p>
    <p style={{ marginTop: 16 }}>
      Three modules. One system. Built to work alone — engineered to work together.
    </p>
  </>,
);
