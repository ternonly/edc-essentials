// Centralized SEO helpers. Use canonicalTags(path) inside any route's head()
// to emit the canonical <link> + matching og:url meta. Keeps absolute URLs
// consistent and avoids duplicate-content issues from query strings (?lng=ar etc).

export const SITE_URL = "https://survival72hour.com";

export function absUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalTags(path: string): {
  meta: { property?: string; name?: string; content: string }[];
  links: { rel: string; href: string; hrefLang?: string }[];
} {
  const url = absUrl(path);
  return {
    meta: [
      { property: "og:url", content: url },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "en", href: url },
      { rel: "alternate", hrefLang: "ar", href: `${url}?lng=ar` },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
  };
}

// FAQ JSON-LD builder for policy/info pages.
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
