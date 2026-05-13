import { createFileRoute, Link } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags, faqJsonLd } from "@/lib/seo";

const FAQ = [
  { q: "Who qualifies for the discount?", a: "Active military, veterans, law enforcement, firefighters and EMS qualify for 10% off every order." },
  { q: "How is service status verified?", a: "Verification is handled by GOVX ID, an independent service trusted by hundreds of US-based brands. Survival72 never sees your documents." },
  { q: "How do I redeem the discount?", a: "Once verified through GOVX ID, use code GOVX10 at checkout for 10% off." },
];

export const Route = createFileRoute("/military-discount")({
  head: () => {
    const c = canonicalTags("/military-discount");
    return {
      meta: [
        { title: "Military & First Responder Discount — Survival72™" },
        { name: "description", content: "10% off for active military, law enforcement, firefighters, and EMS — verified via GOVX ID." },
        { property: "og:title", content: "Military & First Responder — 10% Off" },
        { property: "og:description", content: "Verified service discount through GOVX ID." },
        ...c.meta,
      ],
      links: c.links,
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(FAQ)) },
      ],
    };
  },
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="military-discount"
        defaults={{
          kicker: "Service discount",
          title: "Military & First Responder — 10% Off",
          intro:
            "Active military, law enforcement, firefighters, and EMS get 10% off every order. Verified through GOVX ID.",
          body_md: `
## How GOVX verification works
1. Click **Verify with GOVX ID** below
2. Enter your service category and ID
3. Once verified, use code **GOVX10** at checkout for 10% off

GOVX is an independent verification service trusted by hundreds of US-based brands. Survival72™ never sees your personal documents.

Questions: survival72bob@gmail.com
          `.trim(),
        }}
      />
      <div style={{ textAlign: "center", padding: "0 24px 80px" }}>
        <Link to="/govx-verify" className="s72-btn s72-btn-primary">
          Verify with GOVX ID →
        </Link>
      </div>
    </div>
  ),
});
