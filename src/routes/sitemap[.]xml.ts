import { createFileRoute } from "@tanstack/react-router";

import { buildSitemapXml } from "@/lib/seo";
import { products } from "@/lib/products";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildSitemapXml(products.map((product) => product.slug)), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
