import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/our-promise")({
  head: () => ({
    meta: [
      { title: "Our Promise — Survival72™" },
      { name: "description", content: "Free shipping, 2-year guarantee, 30-day returns, gift-ready." },
    ],
  }),
  component: () => (
    <StaticPage
      title="Our Promise"
      intro="Four guarantees that come with every Survival72 module."
    >
      <ul style={{ paddingLeft: 18, lineHeight: 2 }}>
        <li>Free shipping on orders over $100.</li>
        <li>2-year guarantee on every module.</li>
        <li>30-day returns, no questions asked.</li>
        <li>Gift-ready magnetic box available at checkout.</li>
      </ul>
    </StaticPage>
  ),
});
