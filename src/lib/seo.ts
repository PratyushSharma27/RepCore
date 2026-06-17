import type { Product } from "./products";

export const SITE_NAME = "RepCore";
export const SITE_TAGLINE = "Pro Training Gear";
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://repcore.online").replace(
  /\/$/,
  "",
);
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`;
export const DEFAULT_DESCRIPTION =
  "Shop pro-grade training gear at RepCore — resistance bands, lifting straps, wrist wraps, grip strengtheners, shakers, foam rollers and massage guns built for serious athletes.";

export type PageSeoOptions = {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
  ogImage?: string;
  robots?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function absoluteUrl(path = "/"): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatPageTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify(data),
  };
}

export function createPageHead(options: PageSeoOptions) {
  const url = absoluteUrl(options.path ?? "/");
  const ogImage = absoluteUrl(options.ogImage ?? DEFAULT_OG_IMAGE);
  const fullTitle = formatPageTitle(options.title);

  const meta = [
    { title: fullTitle },
    { name: "description", content: options.description },
    ...(options.keywords ? [{ name: "keywords", content: options.keywords }] : []),
    ...(options.robots ? [{ name: "robots", content: options.robots }] : []),
    { name: "author", content: SITE_NAME },
    { name: "application-name", content: SITE_NAME },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: options.description },
    { property: "og:type", content: options.ogType ?? "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: `${SITE_NAME} — ${options.title}` },
    { property: "og:locale", content: "en_IN" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: options.description },
    { name: "twitter:image", content: ogImage },
  ];

  const links = [{ rel: "canonical", href: url }];

  const scripts = options.jsonLd
    ? [
        jsonLdScript(
          Array.isArray(options.jsonLd)
            ? options.jsonLd
            : options.jsonLd,
        ),
      ]
    : [];

  return { meta, links, scripts };
}

export function createNoIndexHead(title: string, description: string, path: string) {
  return createPageHead({
    title,
    description,
    path,
    robots: "noindex, nofollow",
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    email: "support@repcore.co",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const image = absoluteUrl(product.image);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [image],
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(
  groups: { title: string; items: { q: string; a: string }[] }[],
) {
  const mainEntity = groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  );

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export const PUBLIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
] as const;

export function buildSitemapXml(productSlugs: string[]) {
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    ...PUBLIC_ROUTES.map(
      (route) => `
  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    ),
    ...productSlugs.map(
      (slug) => `
  <url>
    <loc>${absoluteUrl(`/products/${slug}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
  ].join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

export function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Disallow: /admin
Disallow: /cart
Disallow: /checkout
Disallow: /orders

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}
