import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () => {
    const c = canonicalTags("/privacy-policy");
    return {
      meta: [
        { title: "Privacy Policy — Survival72™" },
        { name: "description", content: "Your data, your trust. We never sell or rent customer information." },
        { property: "og:title", content: "Privacy Policy" },
        { property: "og:description", content: "How Survival72 collects, uses and protects your information." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="privacy-policy"
        defaults={{
          kicker: "Privacy",
          title: "Your Data, Your Trust",
          intro: "We collect only what's needed to fulfil your order — name, shipping address, email, phone.",
          body_md: `
## We never
- Sell or rent your data
- Share data except for order fulfilment
- Store your payment card details

## We do
- Send order updates and (optional) promotions
- Include an unsubscribe link in every email
- Delete your data within 30 days on request

Contact: survival72bob@gmail.com
          `.trim(),
        }}
      />
    </div>
  ),
});
