// Retire query-language variants while preserving every original page route.
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function languageLink(url, language) {
  const target = new URL(url);
  target.searchParams.set('lang', language);
  return escapeHtml(target.href);
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const language = url.searchParams.get('lang');
  if (!['GET', 'HEAD'].includes(request.method) || language === null || ['en', 'zh'].includes(language) ||
      /^\/(?:api|assets|data|admin)(?:\/|$)/.test(url.pathname)) {
    return context.next();
  }

  const response = await context.next();
  if (response.status !== 200 || !response.headers.get('Content-Type')?.toLowerCase().includes('text/html')) return response;

  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Language version removed | 此语言版本已删除</title>
</head>
<body>
<main style="max-width:42rem;margin:4rem auto;padding:0 1.5rem;font:1rem/1.6 Arial,sans-serif">
<h1>Language version removed</h1>
<p>This language version has been permanently removed. This page remains available in English and Chinese.</p>
<p lang="zh">此语言版本已永久删除。您仍可查看此页面的英文或中文版本。</p>
<nav aria-label="Available language versions"><a href="${languageLink(url, 'en')}" lang="en">English</a> · <a href="${languageLink(url, 'zh')}" lang="zh">中文</a></nav>
</main>
</body>
</html>`;

  return new Response(request.method === 'HEAD' ? null : body, {
    status: 410,
    statusText: 'Gone',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}
