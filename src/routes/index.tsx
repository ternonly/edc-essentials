import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Problem } from "@/components/home/Problem";
import { System } from "@/components/home/System";
import { Edu } from "@/components/home/Edu";
import { Proof } from "@/components/home/Proof";
import { Promise as TrustPromise } from "@/components/home/Promise";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Survival72™ — Built for the 72 hours that matter" },
      {
        name: "description",
        content:
          "Professional-grade modular EDC tools. Pliers, wrench, axe — engineered for 72-hour deployment. Ships across the GCC.",
      },
      { property: "og:title", content: "Survival72™ — Built for the 72 hours that matter" },
      { property: "og:description", content: "Modular EDC tools engineered for 72-hour deployment." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Problem />
      <System />
      <Edu />
      <Proof />
      <TrustPromise />
    </>
  );
}
