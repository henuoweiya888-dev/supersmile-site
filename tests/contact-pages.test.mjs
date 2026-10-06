import assert from 'node:assert/strict';
import test from 'node:test';
import { onRequestGet, onRequestPost } from '../functions/api/contact.js';

const CONTACT_URL = 'https://supersmile-tech.com/api/contact';
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37, 0x0A]);

function environment() {
  return {
    CONTACT_UPLOAD_ENABLED: 'true',
    TURNSTILE_SITE_KEY: 'public-test-key',
    TURNSTILE_SECRET: 'private-test-key',
    ZOHO_CLIENT_ID: 'test-client',
    ZOHO_CLIENT_SECRET: 'test-client-secret',
    ZOHO_REFRESH_TOKEN: 'test-refresh',
    ZOHO_ACCOUNT_ID: '123456789',
    ZOHO_FROM_ADDRESS: 'sales@supersmile-tech.com',
  };
}

function form(fields = {}, files = []) {
  const body = new FormData();
  const values = {
    first_name: 'Jane',
    last_name: 'Buyer',
    email: 'jane@example.org',
    message: 'Please quote this harness.',
    products: 'Industrial cable assembly',
    'cf-turnstile-response': 'valid-token',
    ...fields,
  };
  for (const [key, value] of Object.entries(values)) body.set(key, value);
  for (const file of files) body.append('files', file);
  return new Request(CONTACT_URL, {
    method: 'POST',
    headers: { Origin: 'https://supersmile-tech.com' },
    body,
  });
}

function stubServices({ turnstile = true, upload = true, send = true } = {}) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    const endpoint = String(url);
    calls.push({ endpoint, options });
    if (endpoint.includes('/turnstile/v0/siteverify')) {
      return Response.json({ success: turnstile, hostname: 'supersmile-tech.com', action: 'contact' });
    }
    if (endpoint.includes('/oauth/v2/token')) {
      assert.equal(new URL(endpoint).searchParams.has('refresh_token'), false);
      assert.equal(options.body.get('refresh_token'), 'test-refresh');
      return Response.json({ access_token: 'test-access-token', expires_in: 3600 });
    }
    if (endpoint.includes('/messages/attachments')) {
      if (!upload) return Response.json({ status: { code: 500 } }, { status: 500 });
      const attached = options.body.getAll('attach');
      return Response.json({
        status: { code: 200 },
        data: attached.map((file, index) => ({
          storeName: `store-${index}`,
          attachmentName: file.name,
          attachmentPath: `/Mail/test-${index}`,
        })),
      });
    }
    if (endpoint.endsWith('/messages')) {
      if (!send) return Response.json({ status: { code: 500 } }, { status: 500 });
      return Response.json({ status: { code: 200 }, data: { messageId: 'zoho-test-id' } });
    }
    throw new Error(`Unexpected mocked endpoint ${endpoint}`);
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test('GET publishes only public readiness and upload limits', async () => {
  const unready = await onRequestGet({ env: {} });
  assert.equal((await unready.json()).ready, false);
  const disabled = environment();
  disabled.CONTACT_UPLOAD_ENABLED = 'false';
  assert.equal((await (await onRequestGet({ env: disabled })).json()).ready, false);
  const ready = await onRequestGet({ env: environment() });
  const payload = await ready.json();
  assert.equal(payload.ready, true);
  assert.equal(payload.turnstileSiteKey, 'public-test-key');
  assert.equal(payload.maxTotalBytes, 3 * 1024 * 1024);
  assert.equal(JSON.stringify(payload).includes('test-client-secret'), false);
});

test('no-file inquiry sends a plaintext email through China Zoho API', async () => {
  const mock = stubServices();
  try {
    const response = await onRequestPost({ request: form(), env: environment() });
    assert.equal(response.status, 202, JSON.stringify({ payload: await response.clone().json(), calls: mock.calls.map((call) => call.endpoint) }));
    assert.deepEqual(await response.json(), { ok: true, messageId: 'zoho-test-id' });
    const send = mock.calls.find((call) => call.endpoint.endsWith('/messages'));
    assert.ok(send);
    assert.ok(send.endpoint.startsWith('https://mail.zoho.com.cn/'));
    const payload = JSON.parse(send.options.body);
    assert.equal(payload.fromAddress, 'sales@supersmile-tech.com');
    assert.equal(payload.toAddress, 'sales@supersmile-tech.com');
    assert.equal(payload.mailFormat, 'plaintext');
    assert.match(payload.content, /jane@example.org/);
    assert.deepEqual(payload.attachments, []);
  } finally {
    mock.restore();
  }
});

test('PDF attachment is uploaded using Zoho attach field and referenced in send', async () => {
  const mock = stubServices();
  try {
    const request = form({}, [new File([PDF], '../harness.pdf', { type: 'application/pdf' })]);
    const response = await onRequestPost({ request, env: environment() });
    assert.equal(response.status, 202);
    const upload = mock.calls.find((call) => call.endpoint.includes('/messages/attachments'));
    assert.ok(upload);
    assert.equal(upload.options.body.getAll('attach').length, 1);
    assert.equal(upload.options.body.get('attach').name, 'harness.pdf');
    const send = mock.calls.find((call) => call.endpoint.endsWith('/messages'));
    assert.deepEqual(JSON.parse(send.options.body).attachments, [{
      storeName: 'store-0', attachmentName: 'harness.pdf', attachmentPath: '/Mail/test-0',
    }]);
  } finally {
    mock.restore();
  }
});

test('inquiry page records a public route and excludes query data', async () => {
  const mock = stubServices();
  try {
    let response = await onRequestPost({ request: form({ source_page: '/custom' }), env: environment() });
    assert.equal(response.status, 202);
    let sent = mock.calls.filter(call => call.endpoint.endsWith('/messages')).at(-1);
    assert.match(JSON.parse(sent.options.body).content, /Inquiry page \(visitor supplied\): \/custom/);
    response = await onRequestPost({ request: form({ source_page: '/contact?email=private@example.org' }), env: environment() });
    assert.equal(response.status, 202);
    sent = mock.calls.filter(call => call.endpoint.endsWith('/messages')).at(-1);
    assert.match(JSON.parse(sent.options.body).content, /Inquiry page \(visitor supplied\): Not recorded/);
    assert.doesNotMatch(JSON.parse(sent.options.body).content, /private@example/);
  } finally { mock.restore(); }
});

test('failed upload prevents send and cannot be reported as success', async () => {
  const mock = stubServices({ upload: false });
  try {
    const response = await onRequestPost({
      request: form({}, [new File([PDF], 'drawing.pdf', { type: 'application/pdf' })]),
      env: environment(),
    });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).code, 'upload_failed');
    assert.equal(mock.calls.some((call) => call.endpoint.endsWith('/messages')), false);
  } finally {
    mock.restore();
  }
});

test('failed Zoho send cannot be reported as success', async () => {
  const mock = stubServices({ send: false });
  try {
    const response = await onRequestPost({ request: form(), env: environment() });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  } finally {
    mock.restore();
  }
});

test('invalid Turnstile token never requests a Zoho access token', async () => {
  const mock = stubServices({ turnstile: false });
  try {
    const response = await onRequestPost({ request: form(), env: environment() });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, 'verification_failed');
    assert.equal(mock.calls.length, 1);
  } finally {
    mock.restore();
  }
});

test('spoofed PDF is rejected before any external request', async () => {
  const mock = stubServices();
  try {
    const response = await onRequestPost({
      request: form({}, [new File(['bad PDF'], 'drawing.pdf', { type: 'application/pdf' })]),
      env: environment(),
    });
    assert.equal(response.status, 415);
    assert.equal(mock.calls.length, 0);
  } finally {
    mock.restore();
  }
});

test('unconfigured service and off-site origin fail closed', async () => {
  const unready = await onRequestPost({ request: form(), env: {} });
  assert.equal(unready.status, 503);
  const request = form();
  request.headers.set('Origin', 'https://attacker.example');
  const rejected = await onRequestPost({ request, env: environment() });
  assert.equal(rejected.status, 403);
});
