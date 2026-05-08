import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Survival72™" },
      { name: "description", content: "Get in touch with Survival72 support and sales." },
    ],
  }),
  component: () => (
    <StaticPage title="Contact" intro="We answer every message within one business day.">
      <p>
        General: <b>hello@survival72gear.com</b>
        <br />
        Support: <b>support@survival72gear.com</b>
        <br />
        Wholesale: <b>wholesale@survival72gear.com</b>
      </p>
    </StaticPage>
  ),
});
