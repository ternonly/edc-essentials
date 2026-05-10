import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Warranty — Survival72™" },
      { name: "description", content: "2-year unconditional guarantee on every Survival72 module." },
    ],
  }),
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="warranty"
        defaults={{
          kicker: "2-Year Guarantee",
          title: "2-Year Unconditional Guarantee",
          intro: "If it breaks under normal use within 2 years, we replace it. No warranty card. No debates.",
          body_md: `
Alternatively: **40% off a re-purchase** (buyer pays shipping).

## Covered
- Manufacturing defects
- Material failure
- Functional breakage under intended use

## Not covered
- Loss or theft
- Cosmetic wear (scratches, patina)
- Fire, flood, or combat damage

## Claim
Email **survival72bob@gmail.com** with a photo. Replacement ships within 48h — *before* you return the original.
          `.trim(),
        }}
      />
    </div>
  ),
});
