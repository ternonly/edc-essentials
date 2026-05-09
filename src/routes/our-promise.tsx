import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/our-promise")({
  head: () => ({
    meta: [
      { title: "Our Promise — Survival72™" },
      { name: "description", content: "Free shipping, 2-year guarantee, 30-day returns, gift-ready." },
    ],
  }),
  component: () => (
    <DynamicPage
      slug="our-promise"
      defaults={{
        title: "Our Promise",
        intro: "Four guarantees that come with every Survival72 module.",
        body_md:
          "- Free shipping on orders over $100.\n- 2-year guarantee on every module.\n- 30-day returns, no questions asked.\n- Gift-ready magnetic box available at checkout.",
      }}
    />
  ),
});
