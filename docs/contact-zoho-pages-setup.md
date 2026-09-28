# Website contact form: Zoho China API setup

This is the no-DNS-change alternative to the unshipped Cloudflare Email Service Worker in `workers/contact/`. The live implementation is `functions/api/contact.js`, a Cloudflare Pages Function at `/api/contact`. It sends website inquiries, with optional attachments, through the existing Zoho Mail account. It does **not** enable Cloudflare Email Sending or Email Routing, change MX records, or store submissions in the website repository.

## Before enabling the upload UI

1. Confirm this Git repository is the source for the **Cloudflare Pages** project serving `supersmile-tech.com`. Pages automatically deploys a root-level `functions/api/contact.js` as `/api/contact`. If the live site is not a Pages project, this file will not create a live endpoint.
2. Confirm the Zoho Mail account is in the China data center by checking the logged-in Mail URL (`mail.zoho.com.cn`). The API must use `mail.zoho.com.cn`, and OAuth token refresh must use `accounts.zoho.com.cn`.
3. In the China Zoho developer console (`https://accounts.zoho.com.cn/developerconsole`), create a server-side or Self Client OAuth app for the account that will send the notification. Grant only `ZohoMail.messages.CREATE` for ongoing send/upload access. Request offline access and obtain a refresh token. If you need to discover the account ID through `GET /api/accounts`, use `ZohoMail.accounts.READ` for that one-time step. The sending `fromAddress` must belong to the authenticated account or its allowed alias.
4. In Cloudflare Pages → project → Settings → Variables and Secrets, configure the **production** environment values below as encrypted secrets (the site key and enable switch can be normal variables). Leave `CONTACT_UPLOAD_ENABLED` unset or `false` during setup:

   | Name | Meaning |
   | --- | --- |
   | `CONTACT_UPLOAD_ENABLED` | Set to the literal text `true` only after the inbox test and rate rule below |
   | `ZOHO_CLIENT_ID` | China Zoho OAuth app client ID |
   | `ZOHO_CLIENT_SECRET` | OAuth client secret |
   | `ZOHO_REFRESH_TOKEN` | Offline refresh token with `ZohoMail.messages.CREATE` |
   | `ZOHO_ACCOUNT_ID` | Numeric Zoho Mail account ID of the sending account |
   | `ZOHO_FROM_ADDRESS` | Existing `@supersmile-tech.com` address authorized for that Zoho account |
   | `TURNSTILE_SITE_KEY` | Public key of a Cloudflare Turnstile widget for the site |
   | `TURNSTILE_SECRET` | Private Turnstile validation key |

   Do not commit or paste any of the secrets into the public repository, HTML/JS, or chat. Set Preview environment values separately only if you intend to test a preview deployment. Redeploy after setting variables.
5. Configure the Turnstile widget for `supersmile-tech.com` (and `www.supersmile-tech.com` if the `www` page is used). The frontend must submit its token as `cf-turnstile-response` with action `contact`. The Function checks the token server-side, including hostname and action.
6. Before turning on direct submission for visitors, add and verify a Cloudflare WAF rate-limiting rule for `POST /api/contact`. Zoho publishes an API limit of 30 requests/minute; one inquiry with an attachment uses a token refresh when needed, one upload, and one send. Keep the form limit substantially below this API limit.
7. Deploy while `CONTACT_UPLOAD_ENABLED` is unset or `false`. Check `GET https://supersmile-tech.com/api/contact`: it must respond with JSON and `ready: false`. The page keeps the existing email-client flow, with no upload control displayed.
8. For an end-to-end test, use a controlled preview environment with its own authorized Turnstile hostname and matching allowed hostname/origin lists, or temporarily enable the production switch during a supervised test window. On production, check that `GET https://supersmile-tech.com/api/contact` changes to `ready: true`; send a test inquiry and one small valid PDF. Verify the attachment and customer email appear in the Zoho sales mailbox and the outbound message is in Zoho Sent. Turn the switch back off immediately if any step fails. Leave it `true` only after the rate rule and inbox test both pass. `202` means Zoho accepted the API request, not that a human read it.

The Zoho API does not document a `Reply-To` field for this send endpoint. The visitor's email is placed clearly in the email body so the sales team can copy it to reply. Do not claim replies automatically target the visitor. Zoho stores attachment uploads before the send call; if the subsequent send fails, an uploaded temporary file may remain in Zoho's file store. No file content or OAuth credential is logged by the Function.

## HTTP contract for the frontend

`GET /api/contact` responds with `{ ok, ready, service, turnstileSiteKey, maxFiles, maxTotalBytes, allowedExtensions }`. `ready` is `true` only when the credentials, keys and `CONTACT_UPLOAD_ENABLED=true` are all present. Keep the existing mail-client flow and do not show a nonworking upload control while `ready` is `false`.

`POST /api/contact` accepts `multipart/form-data` fields `first_name`, `last_name`, `email`, `message`, optional `products` text, repeated `files` fields (up to 3 files and 3 MiB total), and `cf-turnstile-response`. Incoming request bodies are limited to 4 MiB. Success is HTTP `202` with `{ "ok": true, "messageId": "..." }`; errors are 4xx/5xx with `{ "ok": false, "code": "...", "message": "..." }`. The frontend should show success only for the 202 response and should preserve the user's message/files when a submission fails.

Allowed extensions: PDF, JPEG/PNG/WebP, DOC/DOCX, XLS/XLSX, CSV/TXT, ZIP, STEP/STP, IGES/IGS, DXF, and DWG. The Function checks limits, extensions and selected file signatures, then hands the bytes to Zoho. This does not replace malware scanning or cautious handling by sales staff.

## Local test (no real mail sent)

`node --test tests/contact-pages.test.mjs` mocks Turnstile and all Zoho calls. A real inbox test is still required before release.

## Official references

- Zoho China Mail API base: https://www.zoho.com/mail/help/api/getting-started-with-api.html
- China OAuth server and refresh: https://www.zoho.com/connect/api/oauth-authentication-refreshing-access-tokens.html
- Upload attachments: https://www.zoho.com/mail/help/api/post-upload-attachments.html
- Send with attachments: https://www.zoho.com/mail/help/api/post-send-email-attachment.html
- Zoho Mail API limits: https://www.zoho.com/mail/help/adminconsole/rates-and-limits.html
- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/get-started/
- Turnstile server-side verification: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
