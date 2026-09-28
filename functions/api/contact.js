// Cloudflare Pages Function. All Zoho credentials are Pages environment secrets.
const CONTACT_PATH = '/api/contact';
const RECIPIENT = 'sales@supersmile-tech.com';
const ZOHO_MAIL = 'https://mail.zoho.com.cn';
const ZOHO_ACCOUNTS = 'https://accounts.zoho.com.cn';
const MAX_FILES = 3;
const MAX_TOTAL_FILE_BYTES = 3 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const ALLOWED_HOSTNAMES = new Set(['supersmile-tech.com', 'www.supersmile-tech.com']);
const FILE_TYPES = Object.freeze({
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  txt: 'text/plain',
  zip: 'application/zip',
  step: 'model/step',
  stp: 'model/step',
  iges: 'model/iges',
  igs: 'model/iges',
  dxf: 'image/vnd.dxf',
  dwg: 'image/vnd.dwg',
});
const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function fail(status, code, message) {
  return json(status, { ok: false, code, message });
}

function cleanText(value, maxLength, multiline = false) {
  if (typeof value !== 'string') return null;
  const result = value.normalize('NFC')
    .replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '')
    .trim();
  return result.length <= maxLength ? result : null;
}

function cleanFilename(name) {
  const basename = String(name || '').split(/[\\/]/).pop() || '';
  return basename.normalize('NFC')
    .replace(/[\u0000-\u001F\u007F<>:"|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function isFile(value) {
  return value && typeof value.arrayBuffer === 'function' &&
    typeof value.name === 'string' && Number.isFinite(value.size);
}

function validSignature(extension, bytes) {
  const starts = (...parts) => parts.every((part, index) => bytes[index] === part);
  if (extension === 'pdf') return starts(0x25, 0x50, 0x44, 0x46, 0x2D);
  if (extension === 'png') return starts(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
  if (extension === 'jpg' || extension === 'jpeg') return starts(0xFF, 0xD8, 0xFF);
  if (extension === 'webp') {
    return starts(0x52, 0x49, 0x46, 0x46) &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  if (['zip', 'docx', 'xlsx'].includes(extension)) {
    return starts(0x50, 0x4B, 0x03, 0x04) || starts(0x50, 0x4B, 0x05, 0x06);
  }
  if (extension === 'doc' || extension === 'xls') return starts(0xD0, 0xCF, 0x11, 0xE0);
  if (extension === 'txt' || extension === 'csv') return !bytes.includes(0);
  // CAD files vary by vendor and version; restrict by extension and size.
  return true;
}

async function readBodyWithinLimit(request) {
  const advertised = Number(request.headers.get('content-length'));
  if (Number.isFinite(advertised) && advertised > MAX_REQUEST_BYTES) return null;
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function serviceReady(env) {
  return Boolean(
    env?.CONTACT_UPLOAD_ENABLED === 'true' &&
    env?.TURNSTILE_SITE_KEY && env?.TURNSTILE_SECRET &&
    env?.ZOHO_CLIENT_ID && env?.ZOHO_CLIENT_SECRET && env?.ZOHO_REFRESH_TOKEN &&
    /^\d+$/.test(env?.ZOHO_ACCOUNT_ID || '') &&
    /^[^\s@]+@supersmile-tech\.com$/i.test(env?.ZOHO_FROM_ADDRESS || ''),
  );
}

async function verifyTurnstile(token, request, secret) {
  const body = new URLSearchParams({ secret, response: token });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);
  let result;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, unavailable: true };
    result = await readJsonResponse(response);
  } catch {
    return { ok: false, unavailable: true };
  }
  return {
    ok: result?.success === true &&
      ALLOWED_HOSTNAMES.has(result.hostname) && result.action === 'contact',
    unavailable: false,
  };
}

async function getZohoAccessToken(env) {
  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt) {
    return cachedAccessToken;
  }
  // Send credentials in the POST body so they cannot appear in the URL.
  const params = new URLSearchParams({
    refresh_token: env.ZOHO_REFRESH_TOKEN,
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });
  const response = await fetch(`${ZOHO_ACCOUNTS}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    signal: AbortSignal.timeout(10000),
  });
  const result = await readJsonResponse(response);
  if (!response.ok || typeof result?.access_token !== 'string' || !result.access_token) {
    return null;
  }
  cachedAccessToken = result.access_token;
  cachedAccessTokenExpiresAt = Date.now() + Math.min(Number(result.expires_in) || 3600, 3600) * 1000 - 60000;
  return cachedAccessToken;
}

async function uploadToZoho(files, env, token) {
  if (files.length === 0) return [];
  const upload = new FormData();
  for (const file of files) {
    upload.append('attach', new File([file.content], file.filename, { type: file.type }));
  }
  const response = await fetch(
    `${ZOHO_MAIL}/api/accounts/${env.ZOHO_ACCOUNT_ID}/messages/attachments?uploadType=multipart&isInline=false`,
    {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Zoho-oauthtoken ${token}` },
      body: upload,
      signal: AbortSignal.timeout(20000),
    },
  );
  const result = await readJsonResponse(response);
  if (response.status === 429) return { error: 'rate_limited' };
  if (!response.ok || Number(result?.status?.code) !== 200 ||
    !Array.isArray(result?.data) || result.data.length !== files.length) {
    return { error: 'upload_failed' };
  }
  const attachments = result.data.map((item) => ({
    storeName: item?.storeName,
    attachmentName: item?.attachmentName,
    attachmentPath: item?.attachmentPath,
  }));
  if (attachments.some((item) => !item.storeName || !item.attachmentName || !item.attachmentPath)) {
    return { error: 'upload_failed' };
  }
  return attachments;
}

async function sendZohoMessage({ text, files }, env, token) {
  const attachments = await uploadToZoho(files, env, token);
  if (!Array.isArray(attachments)) return attachments;
  const payload = {
    fromAddress: env.ZOHO_FROM_ADDRESS,
    toAddress: RECIPIENT,
    subject: 'New website inquiry | SuperSmile',
    content: text,
    mailFormat: 'plaintext',
    encoding: 'UTF-8',
    attachments,
  };
  const response = await fetch(`${ZOHO_MAIL}/api/accounts/${env.ZOHO_ACCOUNT_ID}/messages`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const result = await readJsonResponse(response);
  if (response.status === 429) return { error: 'rate_limited' };
  if (!response.ok || Number(result?.status?.code) !== 200 || !result?.data?.messageId) {
    return { error: 'send_failed' };
  }
  return { messageId: String(result.data.messageId) };
}

export async function onRequestGet({ env }) {
  const ready = serviceReady(env);
  return json(200, {
    ok: true,
    ready,
    service: 'contact',
    turnstileSiteKey: ready ? env.TURNSTILE_SITE_KEY : null,
    maxFiles: MAX_FILES,
    maxTotalBytes: MAX_TOTAL_FILE_BYTES,
    allowedExtensions: Object.keys(FILE_TYPES).map((extension) => `.${extension}`),
  });
}

export async function onRequestPost({ request, env }) {
  if (new URL(request.url).pathname !== CONTACT_PATH) {
    return fail(404, 'not_found', 'Not found.');
  }
  if (!serviceReady(env)) {
    return fail(503, 'service_unavailable', 'The contact form is temporarily unavailable.');
  }
  const origin = request.headers.get('origin');
  if (origin && !['https://supersmile-tech.com', 'https://www.supersmile-tech.com'].includes(origin)) {
    return fail(403, 'invalid_origin', 'This form must be submitted from the website.');
  }
  if (!/^multipart\/form-data\s*;/i.test(request.headers.get('content-type') || '')) {
    return fail(415, 'invalid_content_type', 'Please submit the form with file uploads enabled.');
  }
  let body;
  try {
    body = await readBodyWithinLimit(request);
  } catch {
    return fail(400, 'invalid_form', 'The form could not be read. Please try again.');
  }
  if (!body) return fail(413, 'request_too_large', 'The form is too large.');
  let form;
  try {
    form = await new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('content-type') },
      body,
    }).formData();
  } catch {
    return fail(400, 'invalid_form', 'The form could not be read. Please try again.');
  }

  const firstName = cleanText(form.get('first_name'), 80);
  const lastName = cleanText(form.get('last_name'), 80);
  const email = cleanText(form.get('email'), 254);
  const message = cleanText(form.get('message'), 10000, true);
  const products = cleanText(form.get('products') || '', 2000, true);
  const token = form.get('cf-turnstile-response');
  if (!firstName || !lastName || !email || !message || products === null ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    return fail(400, 'invalid_fields', 'Please check the required fields and try again.');
  }
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return fail(400, 'verification_required', 'Please complete the verification and try again.');
  }

  const chosenFiles = form.getAll('files');
  if (chosenFiles.length > MAX_FILES) {
    return fail(400, 'too_many_files', `Choose no more than ${MAX_FILES} files.`);
  }
  const files = [];
  let totalBytes = 0;
  for (const file of chosenFiles) {
    if (!isFile(file) || file.size === 0) {
      return fail(400, 'invalid_file', 'One of the selected files is empty or invalid.');
    }
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_FILE_BYTES) {
      return fail(413, 'files_too_large', 'Attachments must total no more than 3 MiB.');
    }
    const filename = cleanFilename(file.name);
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!filename || !Object.hasOwn(FILE_TYPES, extension)) {
      return fail(415, 'unsupported_file', 'This file type is not supported.');
    }
    const content = await file.arrayBuffer();
    if (!validSignature(extension, new Uint8Array(content))) {
      return fail(415, 'unsupported_file', 'A selected file does not match its file type.');
    }
    files.push({ filename, content, type: FILE_TYPES[extension] });
  }

  const verification = await verifyTurnstile(token, request, env.TURNSTILE_SECRET);
  if (verification.unavailable) {
    return fail(503, 'verification_unavailable', 'Verification is unavailable. Please try again.');
  }
  if (!verification.ok) {
    return fail(400, 'verification_failed', 'Verification failed. Please try again.');
  }

  const text = [
    'New website inquiry',
    '',
    `Name: ${firstName} ${lastName}`,
    `Customer email (copy this address to reply): ${email}`,
    `Products: ${products || 'Not selected'}`,
    '',
    'Message:',
    message,
    '',
    'Attachments:',
    files.length ? files.map((file) => `- ${file.filename} (${file.content.byteLength} bytes)`).join('\n') : 'None',
    '',
    'Attachments are supplied by a website visitor. Verify their source before opening.',
  ].join('\n');
  try {
    const accessToken = await getZohoAccessToken(env);
    if (!accessToken) return fail(503, 'service_unavailable', 'The contact form is temporarily unavailable.');
    const sent = await sendZohoMessage({ text, files }, env, accessToken);
    if (sent.error === 'rate_limited') {
      return fail(429, 'rate_limited', 'The service is busy. Please try again later.');
    }
    if (sent.error) {
      return fail(502, sent.error, 'Your inquiry could not be sent. Please try again.');
    }
    return json(202, { ok: true, messageId: sent.messageId });
  } catch {
    // Do not log tokens, request contents, file names, email addresses, or Zoho responses.
    return fail(502, 'send_failed', 'Your inquiry could not be sent. Please try again.');
  }
}
