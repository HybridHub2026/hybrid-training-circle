# Website forms

Both forms POST JSON to `/api/forms`. The same-origin server handler stores each accepted submission in Cloudflare D1 before acknowledging it, then sends a user confirmation and an admin notification through Brevo. Neither the API key nor the Turnstile secret is sent to the browser.

## Resources

- D1 binding: `FORMS_DB`, database `hybridhub-website-forms` (EU jurisdiction).
- Schema: `migrations/0001_website_forms.sql`.
- Public settings: `BREVO_SENDER_EMAIL`, `FORMS_ADMIN_EMAIL`, `FORMS_TURNSTILE_SITE_KEY`.
- Worker secrets, configured in Cloudflare: `BREVO_API_KEY`, `FORMS_TURNSTILE_SECRET`.
- Turnstile action: `website-form`; allow only `hybridhub.pt` and `www.hybridhub.pt` in production.
- Cron: every five minutes retries eligible pending emails.

Keep the public settings and D1 binding in `vite.config.ts` so subsequent GitHub builds preserve them. Store secret values only in Cloudflare Worker secrets. Never add them to Git, public environment variables, screenshots or logs.

## Delivery and limits

Each submission creates separate outbox records for the user and admin. Successful messages are not resent when the other delivery fails. Requests with the same id and content are idempotent; reusing an id for different content is rejected. Launch sign-ups are also deduplicated by email.

The sender reserves at most 300 delivery attempts per UTC day, shared between the two forms. Each normal submission uses two attempts. Requests remain stored if the email allowance is exhausted; pending mail resumes on a later cron run. Brevo may impose a lower available allowance if the account sends other emails.

Brevo idempotency keys are also used. Ambiguous transport failures are not retried beyond the provider's idempotency window; these jobs move to `review` to avoid sending duplicate confirmations. Configuration or permanent provider errors also require review. Do not blindly reset or replay these jobs: confirm the delivery in Brevo first.

## Admin access and existing requests

The owner can use `https://hybridhub.pt/inscritos` to view launch requests, search email addresses, filter by language and download a filtered CSV for Excel. Known migration test addresses are hidden by default. The page is not in the public navigation or sitemap and has `noindex`; actual protection is enforced by the server on every list/export request.

Apply `migrations/0002_subscribers_admin.sql` before deploying this page. Login codes go only to the fixed owner mailbox `hybridhubadmin@gmail.com`, never to an address supplied by the browser. Turnstile is required to request a code; rate limits are one email per minute and 20 per UTC day, counted against the shared Brevo email allowance. Codes expire after 10 minutes, allow five attempts and are single-use. Codes and session tokens are stored only as hashes. Sessions expire after one hour, use a Secure/HttpOnly/SameSite=Strict host-only cookie, and are revoked on logout. Authenticated API responses are private/no-store. No new provider credentials are required.

The database has no public listing endpoint. The account owner can view `form_submissions` and `form_mail_outbox` using Cloudflare D1 Studio or its SQL console. Notification emails also include a submission reference. Filter `form_submissions` by `kind='launch'` to view the launch list, including language and the recorded consent text.

Older requests remain in the existing Formspree account; this migration does not delete them or resend messages to those users. Consolidate existing launch requests before the launch campaign. Apply the site's retention policy to both services.

For a withdrawal or deletion request, use the submission id or verified email to remove the matching stored record; its outbox rows are removed by the foreign key cascade. Also handle copies in the admin mailbox, Brevo and any earlier Formspree records as applicable. Do not treat the automated confirmation as consent to marketing: contact submissions and launch requests remain distinct.

## Verification

- `npm test`: SQLite-backed service tests, localised confirmation/consent and existing site checks.
- `npm run build`: compiles the server route, background retry plugin and frontend.
- `GET /api/forms`: returns only readiness and the public Turnstile site key; no credentials.
- After deployment, submit controlled tests to the account owner's email and verify D1 persistence, both messages and language selection.

The public forms stay disabled when the service is not fully configured. Complete setup and verification before publishing the migration.
# Coaches e comunidades

Página pública `/coaches-comunidades` (também `/es/coaches-comunidades` e `/en/coaches-comunidades`). O formulário envia `kind=partner` com campos estruturados, validados no servidor e proteção Turnstile. O servidor guarda estes pedidos como contactos com assuntos reservados `[Participação] PT / coach` ou `[Participação] Comunidade`; não há alteração ao esquema nem migração de dados. Contactos gerais não podem usar estes assuntos. A fila durável existente envia confirmação localizada e notificação para o administrador.

Em `/inscritos`, selecionar **Coaches e comunidades** para ver respostas e exportar CSV. A mesma autenticação privada protege ambos os grupos; os pedidos ficam separados dos avisos de lançamento. Nenhum pedido cria ou publica automaticamente um perfil na app. Confirmar os dados e a autorização com o participante antes de publicar. Pedidos de eliminação chegam ao email administrativo indicado na política.
