// Retire query-language variants while preserving every original page route.
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const language = url.searchParams.get('lang');
  if (!['GET', 'HEAD'].includes(request.method) || language === null || ['en', 'zh'].includes(language) ||
      /^\/(?:api|assets|data|admin)(?:\/|$)/.test(url.pathname)) {
    return context.next();
  }

  const response = await context.next();
  if (response.status !== 200 || !response.headers.get('Content-Type')?.includes('text/html')) return response;

  url.searchParams.set('lang', 'en');
  return new Response(null, {
    status: 301,
    headers: { Location: url.href, 'Cache-Control': 'public, max-age=86400' },
  });
}
