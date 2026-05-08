import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Survival72™" },
      { name: "description", content: "Why Survival72 builds modular EDC tools for the 72 hours that matter." },
      { property: "og:title", content: "About — Survival72™" },
      { property: "og:description", content: "Brand story, philosophy, team." },
    ],
  }),
  component: () => (
    <StaticPage
      title="About Survival72"
      intro="Survival72™ exists for the 72 hours that matter most — the gap between the moment something goes wrong and the moment you reach safety."
    >
      <p>
        We build modular tools for everyday carry, designed to be genuinely useful in the GCC and
        the wider Middle East. Industrial luxury aesthetic, professional-grade materials, and a
        no-nonsense product roadmap.
      </p>
      <p style={{ marginTop: 16 }}>
        Three modules. One system. Built to work alone — engineered to work together.
      </p>
    </StaticPage>
  ),
});
