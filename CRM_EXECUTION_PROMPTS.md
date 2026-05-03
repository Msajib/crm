# CRM Execution Prompts — Codebase-Aware (5 Phases)
> Each prompt instructs the AI to READ your existing code first, then fix/extend it.
> Never rebuild from scratch. Always modify existing files.

---

<!-- ## PHASE 1 — Auth Fixes + Subdomain Provisioning

```
You are a senior NestJS engineer. I have an existing CRM SaaS at:
c:\Users\Elitebook\Desktop\Projects\CRM

STEP 1 — Read these existing files BEFORE writing any code:
- apps/auth-service/prisma/schema.prisma
- apps/auth-service/src/auth/auth.service.ts
- apps/auth-service/src/auth/auth.controller.ts
- apps/auth-service/src/roles/roles.service.ts
- apps/auth-service/src/roles/roles.controller.ts
- apps/tenant-service/prisma/schema.prisma
- apps/tenant-service/src/tenants/tenants.service.ts
- apps/api-gateway/src (read all files in this directory)
- CRM_SYSTEM_AUDIT_REPORT.md (Auth Service and Tenant Service sections)

STEP 2 — Fix and extend the EXISTING auth-service. Do NOT rewrite it:

1. In apps/auth-service/prisma/schema.prisma, ADD these fields to the existing User model:
   failedLoginCount Int @default(0) @map("failed_login_count")
   lockedUntil DateTime? @map("locked_until")
   mustChangePassword Boolean @default(false) @map("must_change_password")
   createdBy String? @map("created_by")
   
   ADD these new models to the same schema file:
   - PasswordResetToken (id, userId, token unique, expiresAt, used Boolean default false, createdAt)
   - ImpersonationSession (id, superAdminId, targetTenantId, token unique, expiresAt, createdAt)

2. In apps/auth-service/src/auth/auth.service.ts, ADD these methods to the EXISTING AuthService class:
   - forgotPassword(email): find user, create PasswordResetToken, call communication-service to send reset email
   - resetPassword(token, newPassword): validate token not used/expired, hash new password, update user, mark token used
   - createStaff(adminTenantId, dto{email,firstName,lastName,phone,customRoleId}): generate random 12-char password, create User with role=STAFF and same tenantId as admin, call communication-service to send welcome email with credentials, set mustChangePassword=true
   - impersonate(superAdminId, targetTenantId): verify caller is SUPER_ADMIN, create ImpersonationSession with 30min expiry, return temp JWT token with targetTenant injected
   - exitImpersonation(token): delete ImpersonationSession record
   - In existing login() method: increment failedLoginCount on wrong password, throw 423 if lockedUntil > now(), reset failedLoginCount on success

3. In apps/auth-service/src/auth/auth.controller.ts, ADD routes to the EXISTING controller:
   POST /auth/forgot-password
   POST /auth/reset-password
   POST /auth/create-staff (ADMIN role required)
   POST /auth/impersonate/:tenantId (SUPER_ADMIN only)
   POST /auth/impersonation-exit

4. In apps/tenant-service/prisma/schema.prisma, ADD to the EXISTING Tenant model:
   subdomain String? @unique @map("subdomain")
   domainStatus String @default("UNVERIFIED") @map("domain_status")
   domainVerified Boolean @default(false) @map("domain_verified")
   domainVerifiedAt DateTime? @map("domain_verified_at")
   sslExpiresAt DateTime? @map("ssl_expires_at")

5. In apps/tenant-service/src/tenants/tenants.service.ts, ADD to the EXISTING TenantService:
   - generateSubdomain(businessName): slugify name ("Acme Corp" -> "acme-corp"), check uniqueness in DB, append random 4-char suffix if taken, return slug
   - provisionSubdomainForTenant(tenantId): call generateSubdomain, update Tenant record
   - verifyCustomDomain(tenantId, domain): use dns.promises.resolveCname() to check CNAME points to tenant subdomain, update domainStatus
   - Add GET /tenants/by-slug/:slug endpoint (needed by API gateway)
   - Add GET /tenants/by-domain/:domain endpoint

6. In the existing API gateway, ADD host-header middleware:
   - Read req.headers.host
   - Extract subdomain (first part before first dot)
   - Call GET tenant-service/tenants/by-slug/:slug or by-domain/:domain
   - Inject x-tenant-id header into request before routing

STEP 3 — Run migrations:
   cd apps/auth-service && npx prisma migrate dev --name "add_auth_features"
   cd apps/tenant-service && npx prisma migrate dev --name "add_subdomain_fields"

STEP 4 — Verify: run npm run build in both services. Fix any TypeScript errors. Report what was changed in each file.
```

---

## PHASE 2 — Credential Vault + Feature Gating + Fix Security Bug

```
You are a senior NestJS/Next.js engineer. I have an existing CRM SaaS at:
c:\Users\Elitebook\Desktop\Projects\CRM

STEP 1 — Read these existing files BEFORE writing any code:
- apps/admin-panel/app/dashboard/settings/integrations/page.tsx (IMPORTANT: this has a critical bug)
- apps/communication-service/prisma/schema.prisma
- apps/communication-service/src/communications/communications.service.ts
- apps/admin-panel/lib/api.ts
- CRM_SYSTEM_AUDIT_REPORT.md (Communication Service section — read the critical bug about localStorage)

STEP 2 — Create the credential-service (NEW service, does not exist yet):
   Path: apps/credential-service/
   
   Create these files:
   - apps/credential-service/package.json (copy structure from apps/ai-service/package.json, change name to credential-service, port 3010)
   - apps/credential-service/src/main.ts (NestJS bootstrap on port 3010)
   - apps/credential-service/src/app.module.ts
   - apps/credential-service/prisma/schema.prisma with models:
     * TenantCredential: id, tenantId, type(AI|TTS|CALL|SMS|WHATSAPP|EMAIL), provider, encryptedCredentials(Text), isActive, lastTestedAt, testStatus(UNTESTED|OK|FAILED), createdAt, updatedAt — @@unique([tenantId, type])
     * FeatureGate: id, tenantId @unique, gates Json (stores {email,sms,whatsapp,call,aiVoice,aiText} booleans)
   - apps/credential-service/src/credentials/credentials.service.ts:
     * Use Node.js crypto aes-256-gcm for encrypt(text)/decrypt(text) using env CREDENTIAL_ENCRYPTION_KEY
     * saveCredential(tenantId, type, provider, plainCredentials): encrypt JSON, upsert TenantCredential
     * getCredentials(tenantId): return all credentials with encryptedCredentials replaced by masked "****" + isActive/testStatus only
     * revealCredential(tenantId, type): decrypt and return plaintext (requires admin auth)
     * testCredential(tenantId, type): decrypt, call provider API to validate, update testStatus
     * updateFeatureGates(tenantId): check which credential types have isActive=true + testStatus=OK, update FeatureGate JSON
     * getFeatureGates(tenantId): return gates JSON
   - apps/credential-service/src/credentials/credentials.controller.ts:
     * POST /credentials
     * GET /credentials (returns masked)
     * GET /credentials/features (returns feature gates)
     * POST /credentials/test/:type
     * DELETE /credentials/:type
   - Run: cd apps/credential-service && npx prisma migrate dev --name "init"

STEP 3 — Fix the CRITICAL SECURITY BUG in apps/admin-panel/app/dashboard/settings/integrations/page.tsx:
   The current code saves credentials to localStorage (line ~108: localStorage.setItem('crm_integrations_config', ...))
   This is a severe security vulnerability.
   
   Fix it by:
   1. Remove ALL localStorage.setItem and localStorage.getItem calls for credentials
   2. Replace saveConfig() function: instead of localStorage, call POST /api/v1/credentials via the api helper
   3. On page load useEffect: call GET /api/v1/credentials to load saved configs (showing masked values)
   4. Keep the UI exactly as-is, only change the data persistence layer

STEP 4 — Add useFeatureGates hook to admin panel:
   Create apps/admin-panel/hooks/useFeatureGates.ts:
   - On mount: fetch GET /api/v1/credentials/features
   - Return object: { email, sms, whatsapp, call, aiVoice, aiText, loading }
   - Cache in React context so it's not fetched on every component
   
   Apply to apps/admin-panel/app/dashboard/leads/page.tsx:
   - Import useFeatureGates
   - Show WhatsApp button in lead row actions only if gates.whatsapp === true
   - Show Call button only if gates.call === true
   - Show SMS button only if gates.sms === true

STEP 5 — Register credential-service in API gateway (add route /api/v1/credentials -> http://localhost:3010)

STEP 6 — Add credential-service to root package.json workspaces and turbo.json

STEP 7 — Build check: npm run build in credential-service and admin-panel. Fix TypeScript errors. Report all files changed. -->
```

---

## PHASE 3 — Fix Campaign Processors + Build Voice Service

```
You are a senior NestJS engineer. I have an existing CRM SaaS at:
c:\Users\Elitebook\Desktop\Projects\CRM

STEP 1 — Read these existing files BEFORE writing any code:
- apps/marketing-service/src/marketing/marketing.service.ts (read the stub campaign processors at bottom)
- apps/marketing-service/prisma/schema.prisma
- apps/communication-service/src/communications/communications.service.ts
- apps/communication-service/prisma/schema.prisma
- apps/import-service/src/import/import.processor.ts
- CRM_SYSTEM_AUDIT_REPORT.md (Marketing Service and Communication Service sections)

STEP 2 — Fix apps/communication-service:
   In apps/communication-service/prisma/schema.prisma ADD:
   - SmsLog model: id, tenantId, from, to, body, status(SENT|FAILED|DELIVERED), provider, createdAt
   - WhatsAppLog model: id, tenantId, to, body, templateName, status, messageId, createdAt
   - ADD to existing CallLog model: recordingUrl String?, transcript Text?, direction String @default("OUTBOUND")
   
   In apps/communication-service/src/communications/communications.service.ts ADD these methods:
   - sendSms(tenantId, to, body): fetch SMS credentials from credential-service (GET http://localhost:3010/credentials, decrypt), use Twilio REST API (axios POST to https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json), log to SmsLog
   - sendWhatsApp(tenantId, to, templateName, params): fetch WhatsApp credentials from credential-service, POST to Meta Cloud API (https://graph.facebook.com/v18.0/{phone_number_id}/messages), log to WhatsAppLog
   - bulkEmail(tenantId, messages[]): loop and call existing sendEmail() for each, return {sent, failed} counts
   - bulkSms(tenantId, messages[]): loop and call sendSms() for each
   - bulkWhatsApp(tenantId, messages[]): loop and call sendWhatsApp() for each
   
   In communications.controller.ts ADD routes: POST /communications/sms, POST /communications/whatsapp, POST /communications/bulk-email, POST /communications/bulk-sms, POST /communications/bulk-whatsapp
   
   Run: cd apps/communication-service && npx prisma migrate dev --name "add_sms_whatsapp_logs"

STEP 3 — Fix apps/marketing-service — the three STUB processors:
   In apps/marketing-service/src/marketing/marketing.service.ts:
   
   Fix processSmsCampaign(campaign): 
   - Loop campaign.leadIds, fetch each lead from crm-service GET /contacts/:id
   - Render SMS template with lead data (replace {{lead.first_name}} etc.)
   - Call communication-service POST /communications/sms for each
   - Update processedCount/failedCount on campaign every 10 leads
   - Mark COMPLETED when done, FAILED if critical error
   
   Fix processWhatsappCampaign(campaign):
   - Same pattern as SMS but call POST /communications/whatsapp
   
   Fix processCallCampaign(campaign):
   - Call voice-service POST /voice/campaign for this campaign (voice-service built in next step)
   
   Fix processSocialLead() — replace dummy data with real Facebook API call:
   - Call GET https://graph.facebook.com/{leadgen_id}?fields=field_data&access_token={token}
   - Parse field_data array to extract name, email, phone
   - Pass real data when creating contact in crm-service
   
   Add campaign progress tracking to Campaign schema: sentCount, deliveredCount, openCount, replyCount, answeredCount (migrate)

STEP 4 — Create voice-service (NEW service, port 3011):
   apps/voice-service/package.json, src/main.ts, src/app.module.ts
   Install: axios, openai, @google/generative-ai, twilio
   
   apps/voice-service/src/voice/voice.service.ts:
   - generateScript(tenantId, leadData, templateText): fetch AI credentials from credential-service, call OpenAI/Gemini to personalize templateText with leadData, return script string
   - generateAudio(tenantId, script): fetch TTS credentials from credential-service, POST to ElevenLabs API (https://api.elevenlabs.io/v1/text-to-speech/{voice_id}), save MP3 to apps/voice-service/uploads/, return public URL
   - placeCall(tenantId, toPhone, audioUrl): fetch Twilio credentials from credential-service, use Twilio Node SDK to make outbound call with TwiML <Play>{audioUrl}</Play>
   - processCampaignCall(tenantId, leadIds, templateText): loop leads, for each: generateScript -> generateAudio -> placeCall -> log outcome, return stats
   
   apps/voice-service/src/voice/voice.controller.ts endpoints:
   - POST /voice/generate-script
   - POST /voice/generate-audio  
   - POST /voice/place-call
   - POST /voice/campaign
   - POST /voice/webhook/status (Twilio callback: update CallLog with answered/voicemail/no-answer)
   
   Register in API gateway

STEP 5 — Add subscription expiry cron to EXISTING tenant-service:
   In apps/tenant-service/src/tenants/tenants.service.ts ADD:
   @Cron('0 9 * * *') checkSubscriptionExpiry():
   - Query all tenants where expiresAt between now and now+14days -> send warning email via communication-service
   - Query tenants where expiresAt between now and now+3days -> send urgent email
   - Query tenants where expiresAt < now and status=ACTIVE -> set status=SUSPENDED, send expired email

STEP 6 — Enhance import-service duplicate detection:
   In apps/import-service/src/import/import.processor.ts:
   - Before calling crm-service to create contact, call GET /contacts?email={email}&phone={phone}
   - If contact exists: skip row, add to errorLog as DUPLICATE
   - After import complete: call communication-service to send summary email to uploader

STEP 7 — Build all: npm run build in communication-service, marketing-service, voice-service. Fix errors. Report all files modified.
```

---

## PHASE 4 — Lead Detail Page + Payment Links + Analytics

```
You are a senior NestJS/Next.js engineer. I have an existing CRM SaaS at:
c:\Users\Elitebook\Desktop\Projects\CRM

STEP 1 — Read these files BEFORE writing any code:
- apps/crm-service/prisma/schema.prisma
- apps/crm-service/src/crm/crm.service.ts
- apps/crm-service/src/crm/crm.controller.ts
- apps/payment-service/prisma/schema.prisma
- apps/payment-service/src/  (read all files)
- apps/admin-panel/app/dashboard/leads/page.tsx
- apps/admin-panel/app/dashboard/page.tsx (main dashboard)
- CRM_SYSTEM_AUDIT_REPORT.md (CRM Service, Payment Service, Admin Panel sections)

STEP 2 — Fix apps/crm-service:
   In apps/crm-service/prisma/schema.prisma:
   - UPDATE ContactStatus enum: add CONTACTED, ENGAGED, CONVERTED (keep existing values)
   - ADD to Contact model: sourcePlatform String?, aiScore Int?, lastContactedAt DateTime?, rawPayload Json?
   - ADD to Deal model: leadId String? @map("lead_id"), convertedAt DateTime?
   
   In apps/crm-service/src/crm/crm.service.ts ADD these methods to EXISTING CrmService:
   - convertLeadToDeal(tenantId, contactId, dealData{title,value,pipelineId,stageId,closeDate}):
     * Create Deal with contactId linked + leadId = contactId + convertedAt = now()
     * Update Contact status to CONVERTED
     * Create Activity on Contact (type: NOTE, subject: "Converted to Deal")
     * Create Activity on Deal (type: NOTE, subject: "Created from Lead")
     * Return created Deal
   - getContactTimeline(tenantId, contactId): query all Activities where contactId=contactId ordered by createdAt desc, return array
   - assignContact(tenantId, contactId, staffUserId): update Contact.assignedTo, create Activity log entry
   - checkDuplicate(tenantId, email, phone): return existing contact if email or phone matches
   
   In apps/crm-service/src/crm/crm.controller.ts ADD:
   - POST /contacts/:id/convert-to-deal
   - GET /contacts/:id/timeline
   - PATCH /contacts/:id/assign
   - Before existing POST /contacts: call checkDuplicate, return 409 if found
   
   Run: cd apps/crm-service && npx prisma migrate dev --name "lead_enhancements"

STEP 3 — Create Lead Detail Page in admin panel (NEW page, does not exist):
   Create apps/admin-panel/app/dashboard/leads/[id]/page.tsx
   
   This page fetches GET /api/v1/contacts/:id and GET /api/v1/contacts/:id/timeline
   
   Layout sections (use same glassmorphism styling as existing pages):
   1. Header: back button, lead name, status badge, AI score badge
   2. Two-column layout:
      LEFT (2/3 width):
        - Activity Timeline: chronological list of all activities (call icon for calls, mail for emails, message for sms/whatsapp, pencil for notes). Each item shows: type icon, subject/body preview, date, staff name
        - Add Note form at bottom of timeline (POST /activities with type NOTE)
      RIGHT (1/3 width):
        - Contact Info card: phone, email, company, source platform badge, created date
        - Staff Assignment: dropdown of staff users, current assignee shown, on change PATCH /contacts/:id/assign
        - Quick Actions: Email | SMS | WhatsApp | Call buttons (use useFeatureGates hook to show/hide)
        - "Convert to Deal" button: opens modal with fields (title, value, pipeline selector, close date), on submit POST /contacts/:id/convert-to-deal
        - Linked Deals panel: list deals where contactId matches

STEP 4 — Add payment links to EXISTING payment-service:
   In apps/payment-service/prisma/schema.prisma ADD:
   - PaymentLink model: id, token @unique, type, planId?, planName?, customPrice Float?, currency, durationDays Int?, description?, maxUses Int @default(1), usedCount Int @default(0), affiliateId?, commissionPct Float?, expiresAt?, isActive Boolean @default(true), createdBy, createdAt, updatedAt
   - PaymentLinkUse model: id, linkId, tenantId, invoiceId?, usedAt
   
   In existing payment-service src, ADD:
   - createPaymentLink(dto): generate crypto.randomBytes(16).toString('hex') as token, create PaymentLink
   - validatePaymentLink(token): check exists, not expired, usedCount < maxUses, return link with plan details
   - usePaymentLink(token, customerData{name,email,businessName,phone}, paymentData): validate link, charge via Stripe, create tenant (call tenant-service), create admin user (call auth-service), send welcome email, increment usedCount, create PaymentLinkUse
   - Endpoints: POST /payment/links, GET /payment/links, GET /payment/links/:token/validate (PUBLIC), POST /payment/links/:token/checkout (PUBLIC)
   
   Run: cd apps/payment-service && npx prisma migrate dev --name "add_payment_links"

STEP 5 — Create public checkout page (NEW, no auth required):
   Create apps/admin-panel/app/pay/page.tsx
   - Reads ?token= from URL query params
   - Fetches GET /api/v1/payment/links/:token/validate (show 404 if invalid/expired)
   - Shows: plan name, price, features list, form (name, email, business name, phone, Stripe card element)
   - On submit: POST /api/v1/payment/links/:token/checkout
   - On success: show "Account created! Check your email for login details." with subdomain shown

STEP 6 — Create payment links page in Super Admin:
   Create apps/admin-panel/app/dashboard/super-admin/payment-links/page.tsx
   - List all payment links with: token (first 8 chars), type, plan, price, uses/maxUses, expiry, status
   - "Create Link" button: modal with plan selector, custom price, expiry date picker, max uses, description
   - Copy link button (copies full URL with token)
   - Deactivate link button

STEP 7 — Fix analytics-service (currently empty stub):
   Read apps/analytics-service/src/app.module.ts first.
   
   Add Prisma to analytics-service:
   - Schema: AnalyticsSnapshot (id, tenantId, period String, metrics Json, createdAt)
   
   In analytics-service add:
   - GET /analytics/dashboard?tenantId= : query crm-service for contact/deal counts, return KPIs
   - GET /analytics/leads?tenantId= : leads by source, leads by status, daily new leads (last 30 days)
   - Hourly cron @Cron('0 * * * *'): fetch metrics from crm-service, store AnalyticsSnapshot
   
   Update apps/admin-panel/app/dashboard/page.tsx to fetch from analytics-service instead of hardcoded data

STEP 8 — Build check: npm run build in crm-service, payment-service, analytics-service, admin-panel. Fix all TypeScript errors. Report every file changed.
```

---

## PHASE 5 — Production Hardening + Deployment

```
You are a senior DevOps/NestJS engineer. I have an existing CRM SaaS at:
c:\Users\Elitebook\Desktop\Projects\CRM

STEP 1 — Read these files BEFORE writing any code:
- docker-compose.yml
- package.json (root)
- turbo.json
- apps/api-gateway/src (all files)
- .env.example
- CRM_SYSTEM_AUDIT_REPORT.md (Priority Action List section)

STEP 2 — Add production middleware to EACH existing NestJS service
(auth-service, tenant-service, crm-service, communication-service, marketing-service, import-service, ai-service, payment-service, credential-service, voice-service, analytics-service):

For each service's src/main.ts, ADD if not already present:
- app.use(helmet()) — install @nestjs/helmet if missing
- app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' })
- app.use(express.json({ limit: '10mb' }))
- Global validation pipe: app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
- Add GET /health endpoint to each service's app.controller.ts that checks DB connection

For each service, create src/filters/all-exceptions.filter.ts (if not exists):
- Catch all unhandled exceptions
- Log error.stack (not just message)
- Return standardized { statusCode, message, timestamp, path } response

STEP 3 — API Gateway hardening (modify existing api-gateway):
- Add rate limiting: install @nestjs/throttler, apply 100 req/min per IP on public routes
- Add request logging middleware: log method, path, status, duration for every request
- Add CORS: only allow NEXT_PUBLIC_FRONTEND_URL and platform domain
- Add Joi config validation on startup

STEP 4 — Update existing docker-compose.yml:
- ADD Redis service (image: redis:7-alpine, port 6379)
- ADD credential-service service (build from apps/credential-service, port 3010, env file)
- ADD voice-service service (build from apps/voice-service, port 3011, env file)
- ADD volumes for voice-service uploads (/uploads)
- Ensure all services have depends_on: [postgres, redis]
- Add healthcheck to each service (curl /health endpoint)

STEP 5 — Create Dockerfiles for the two new services:
   apps/credential-service/Dockerfile (multi-stage: node:18-alpine build + production)
   apps/voice-service/Dockerfile (multi-stage: node:18-alpine build + production)
   Copy structure from any existing service that has a Dockerfile, or create standard NestJS Dockerfile.

STEP 6 — Create infrastructure/ files:
   infrastructure/nginx.conf:
   - Wildcard server block: server_name ~^(?<subdomain>.+)\.yourdomain\.com$
   - location /api/ proxy_pass to api-gateway :3000
   - location / proxy_pass to Next.js admin panel :3001
   - Gzip compression, proxy headers, upstream health checks
   
   infrastructure/deploy.sh:
   #!/bin/bash
   - git pull origin main
   - For each service: run npx prisma migrate deploy
   - docker-compose build
   - docker-compose up -d
   - docker-compose ps (verify all healthy)
   - echo "Deploy complete"
   
   infrastructure/certbot-setup.sh:
   - certbot certonly --nginx -d yourdomain.com -d *.yourdomain.com
   - Add renewal cron: 0 3 * * * certbot renew --quiet

STEP 7 — Create root .env.production.example documenting ALL required variables:
(All database URLs, Redis URL, JWT secrets, CREDENTIAL_ENCRYPTION_KEY, service URLs, platform domain, payment keys, ALLOWED_ORIGINS)

STEP 8 — Update root README.md with:
- Service architecture table (service name, port, database)
- Local setup: prerequisites, how to install, how to run migrations, how to start
- Production deployment: link to infrastructure/deploy.sh, required DNS config
- Environment variable reference

STEP 9 — Final validation:
- Run npm run build from root (turbo build)
- Check all prisma schemas have been migrated: for each service run npx prisma migrate status
- Verify API gateway routes include all services including credential-service (3010) and voice-service (3011)
- Check no service still reads credentials from process.env directly that should come from credential-service

Report: every file created or modified, any remaining manual steps (DNS setup, SSL, payment gateway keys to configure in Super Admin).
```

---

## QUICK REFERENCE — What Each Phase Fixes

| Phase | Services Modified | Key Deliverables |
|---|---|---|
| 1 | auth-service, tenant-service, api-gateway | Forgot password, impersonation, staff creation, subdomain auto-provision |
| 2 | credential-service (NEW), admin-panel | Secure credential vault, fix localStorage bug, feature gating |
| 3 | communication-service, marketing-service, voice-service (NEW), import-service | Real SMS/WhatsApp, voice calls, fix campaign stubs, duplicate detection |
| 4 | crm-service, payment-service, analytics-service, admin-panel | Lead detail page, convert-to-deal, payment links, checkout page |
| 5 | ALL services, docker-compose, infrastructure/ | Production hardening, Docker, Nginx, deploy scripts |
