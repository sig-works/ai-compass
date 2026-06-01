import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, '') ?? 'https://example.com';
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}${base}/sitemap-index.xml\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
