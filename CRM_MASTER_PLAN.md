# CRM SaaS Platform — Master Plan v4.0
> **Replaces:** CRM_MASTER_PLAN.md v3.0
> **Author:** Senior Software Architect & Business Analyst
> **Date:** May 2026
> **Architecture:** Microservices (NestJS) + Next.js Admin Panel
> **Status:** Active Development — Updated with Subdomain, Background Jobs, Payment Links

---

## 1. EXECUTIVE SUMMARY

This is an **AI-Powered, Social-Lead-First CRM SaaS** built on a microservices architecture. The platform allows businesses of all sizes to capture leads from social media (Facebook, Instagram, LinkedIn, TikTok), manage them through a full lifecycle, communicate via multiple channels (Email, SMS, WhatsApp, AI Voice Call), and convert leads to deals — all from one unified platform.

The system is fully multi-tenant, white-label capable, and subscription-based with three tiers of users: **Super Admin** (platform owner), **Admin** (subscriber/business), and **Staff** (team members).

---

## 2. THREE-TIER USER SYSTEM

### 2.1 Super Admin (Platform Owner)
The owner of the CRM SaaS product itself.

| Capability | Details |
|---|---|
| Platform Branding | Logo, favicon, colors, landing page content |
| Tenant Management | View all tenants (searchable/filterable table) |
| Impersonate Admin | Login to any admin account without password |
| Subscription Control | Extend, suspend, cancel, manually activate any tenant |
| Ban / Unban | Block/restore admin account access |
| Force Password Reset | Send reset email to any admin |
| Global SMTP | Configure system-wide email (welcome, reset, warnings, expiry) |
| Payment Gateway Config | Stripe, PayPal, Razorpay, SSLCommerz, bKash |
| Subscription Plans | Create/edit/delete pricing tiers |
| Platform Analytics | MRR, churn rate, total tenants, active users |
| Announcement Broadcast | System-wide message to all admins |
| AI Config (Global) | Set global fallback AI credentials for tenants without own |

### 2.2 Admin (Tenant / Subscriber)
A business owner who purchases a subscription plan.

| Capability | Details |
|---|---|
| Credential Vault | Configure all external service keys (AI, SMS, Email, WhatsApp, Voice) |
| Team Management | Create / edit / delete staff accounts |
| Role Builder | Create custom roles with menu-level permissions |
| Lead Assignment Rules | Set auto-assignment (round-robin, territory, skill-based) |
| Subscription Management | View plan, usage limits, billing history |
| Workspace Branding | Custom logo, colors within their workspace |
| Custom Domain | Map their own domain to the CRM |
| API Keys | Generate REST API keys for external lead ingestion |
| Audit Logs | View all staff actions with timestamps |
| Pipeline Management | Create/customize deal pipelines and stages |

### 2.3 Staff (Team Member)
Created by Admin. Access is strictly controlled by assigned role.

| Capability | Details |
|---|---|
| Menu Access | Only sees menus that admin has permitted in their role |
| Lead Management | View, work, communicate with assigned leads |
| Deal Management | Create/update deals converted from leads |
| Communication | Can use channels only if admin has configured credentials |
| Personal Dashboard | Own performance metrics and task list |

---

## 3. SUBSCRIPTION PLANS

| Tier | Price | Staff | Leads | Social Platforms | AI Voice | WhatsApp |
|---|---|---|---|---|---|---|
| **Starter** | $29/mo | 1 | 500 | 1 | ❌ | ❌ |
| **Growth** | $79/mo | 5 | 5,000 | 2 | ❌ | ✅ |
| **Business** | $199/mo | 20 | 25,000 | All | ✅ | ✅ |
| **Enterprise** | Custom | Unlimited | Unlimited | All | ✅ | ✅ |
| **White-Label** | $499/mo | Unlimited | Unlimited | All | ✅ | ✅ |

**Add-Ons:**
- AI Voice Call Minutes: $0.05/min
- Extra Staff Seats: $15/user/mo
- Extra Lead Storage: $20/10,000 leads
- Premium AI Models (GPT-4o, Claude 3.5): $29/mo add-on

---

## 4. MICROSERVICES ARCHITECTURE

### Current Services (Existing)
| Service | Port | Database | Status |
|---|---|---|---|
| `api-gateway` | 3000 | — | ✅ Running |
| `auth-service` | 3001 | `crm_auth_db` | ✅ Running |
| `tenant-service` | 3002 | `crm_tenant_db` | ✅ Running |
| `crm-service` | 3003 | `crm_core_db` | ✅ Running |
| `communication-service` | 3004 | `crm_comm_db` | ✅ Running |
| `marketing-service` | 3005 | `crm_marketing_db` | ✅ Running |
| `import-service` | 3006 | `crm_import_db` | ✅ Running |
| `ai-service` | 3007 | `crm_ai_db` | ✅ Running |
| `payment-service` | 3008 | `crm_payment_db` | ✅ Running |
| `analytics-service` | 3009 | — | ⚠️ Stub only |

### New Services Required
| Service | Port | Database | Status |
|---|---|---|---|
| `credential-service` | 3010 | `crm_credential_db` | 🔴 NOT BUILT |
| `voice-service` | 3011 | `crm_voice_db` | 🔴 NOT BUILT |
| `template-service` | 3012 | `crm_template_db` | 🔴 NOT BUILT (email templates exist in comm-service) |
| `notification-service` | 3013 | — | 🔴 NOT BUILT (partial in comm-service) |
| `lead-ingestion-service` | 3014 | — | 🔴 NOT BUILT (basic webhook in marketing-service) |

---

## 5. FEATURE MODULES (COMPLETE SPECIFICATION)

### MODULE A: Social Lead Ingestion

#### A.1 Lead Sources
- **Facebook Lead Ads** — OAuth + Webhook listener on marketing-service
- **Instagram** — Meta Ads API lead forms
- **LinkedIn Lead Gen Forms** — LinkedIn Marketing API
- **TikTok Lead Generation** — TikTok Business API
- **Manual Upload** — CSV/Excel via import-service
- **API Endpoint** — REST API with tenant API key authentication
- **WhatsApp** — Form/opt-in capture via WhatsApp Cloud API
- **Landing Page Forms** — Embeddable lead capture forms (future)

#### A.2 Lead Source Data Required
Every lead must carry:
```
source_platform  : FACEBOOK | INSTAGRAM | LINKEDIN | TIKTOK | MANUAL | API | WHATSAPP
source_campaign  : linked ad campaign ID (if applicable)
raw_payload      : original webhook payload stored as JSON
ingested_at      : UTC timestamp
tenant_id        : multi-tenant isolation (RLS)
assigned_to      : null initially, set by assignment engine
```

#### A.3 Duplicate Detection
- Fuzzy match on phone number (normalized E.164 format)
- Exact match on email (case-insensitive)
- Merge suggestion shown in UI if duplicate detected
- Admin configures: auto-merge | prompt | create-anyway

#### A.4 Real-time Lead Notification
When a new lead arrives → notify assigned staff via:
- In-app notification badge
- Email alert (if configured)
- WhatsApp message (if configured)

---

### MODULE B: Lead Management

#### B.1 Lead Lifecycle States
```
New → Contacted → Engaged → Qualified → Converted → Lost
```
Each state transition logged in activity timeline.

#### B.2 Lead Table Features
- Columns: Name, Phone, Email, Source, Status, Score, Assigned To, Created, Actions
- **Conditional Channel Columns:** WhatsApp column only visible if WhatsApp configured
- Multi-filter: by status, source, tag, date range, assigned staff, AI score
- Bulk actions: Assign, Tag, Export, Delete, Add to Campaign
- Quick contact buttons in row: Call | SMS | Email | WhatsApp (gated by credentials)

#### B.3 Lead Detail Page (360° View)
- Contact information panel
- Activity timeline (all calls, emails, messages, notes)
- Linked deals panel
- AI score display with explanation
- Communication panel (compose email/sms/whatsapp from lead page)
- Staff assignment dropdown
- "Convert to Deal" button (only visible for QUALIFIED status or admin override)
- File attachments (proposals, contracts)
- Custom fields (configurable by admin)

#### B.4 Staff Assignment Engine
- **Manual**: Admin/Manager selects a staff member
- **Round-Robin**: Distribute evenly among online/available staff
- **Skill-Based**: Route based on lead tag matching staff expertise tags
- **Territory**: Route by country/city
- Assignment changes logged in timeline

---

### MODULE C: Multi-Channel Communication

#### C.1 Per-Lead Communication (1:1)
From lead detail page, staff can:
- **Send Email** — compose with AI draft assist, logged in timeline
- **Send SMS** — via configured SMS gateway, logged
- **WhatsApp Message** — via WhatsApp Cloud API, logged (only if configured)
- **Make Call** — browser-based VoIP OR AI voice call (only if configured)
- **Log Manual Call** — record outcome if called on personal phone
- **Add Note** — internal note visible to team

#### C.2 Credential-Gated UI (CRITICAL)
```
Feature visibility logic:
if (whatsapp_credentials_configured) → show WhatsApp button + tab
if (call_credentials_configured)     → show Call button
if (sms_credentials_configured)      → show SMS button
if (ai_tts_credentials_configured)   → show AI Voice option
Email always shows (requires SMTP config)
```

#### C.3 Conversation Inbox (Two-Way Messaging)
- Shared inbox for all incoming messages (WhatsApp, Facebook DM, Instagram DM)
- Any staff member with inbox permission can pick up
- Thread view with full history
- AI suggests reply based on conversation context
- Assign conversation to specific staff
- Internal notes on conversation (not visible to lead)

---

### MODULE D: Campaign System

#### D.1 Campaign Types
| Type | Requires |
|---|---|
| Email Campaign | SMTP/SendGrid config |
| SMS Campaign | SMS gateway config |
| WhatsApp Campaign | WhatsApp Cloud API config |
| AI Voice Call Campaign | AI + TTS + Call provider config |
| Multi-channel Sequence | Email → SMS → Call (sequential) |

#### D.2 Campaign Builder Workflow (5 Steps)
```
Step 1: Name & Type → select campaign type (tab only shows if credentials exist)
Step 2: Audience   → filter leads by status, tag, source, date, assigned staff
Step 3: Template   → select existing or create new (with AI assist button)
Step 4: Schedule   → send now OR pick date/time (with timezone)
Step 5: Review     → confirm count, preview, launch
```

#### D.3 Campaign Analytics
Per campaign, track:
- Total targeted leads
- Sent count / Failed count
- Email: Open rate, Click rate, Bounce rate, Unsubscribe rate
- SMS: Delivered rate, Failed rate
- WhatsApp: Delivered, Read, Replied
- Voice: Answered, Voicemail, No-answer, Busy

#### D.4 Campaign Cron Processor
- Runs every minute checking for PENDING campaigns where `scheduledAt <= now()`
- Processes in batches of 10 (configurable)
- Rate limiting: max 100 emails/min, 50 SMS/min, 20 calls/min
- On error: mark FAILED with error message, send admin alert

---

### MODULE E: AI Voice Call System (NEW — Critical)

#### E.1 Required Credentials (Admin Configures)
1. **AI Provider** (OpenAI / Gemini / Claude) — for script generation
2. **TTS Provider** (ElevenLabs / Google TTS / AWS Polly) — for audio
3. **Calling Provider** (Twilio Voice / Vonage / Plivo / local SIP) — for dialing

All three required before voice call features become visible.

#### E.2 Voice Call Modes
| Mode | Description | Use Case |
|---|---|---|
| Real-time AI | AI speaks live via TTS stream | Interactive sales calls |
| Pre-recorded | Admin uploads audio file | Announcements, reminders |
| AI-Generated Pre-call | AI script → TTS → play once | Personalized campaigns |
| IVR | AI responds to keypresses | Surveys, appointment confirm |

#### E.3 AI Voice Campaign Flow
```
Campaign launch → For each lead in batch:
  1. Generate personalized call script (AI Provider)
     Input: lead data + template + tone preferences
  2. Convert script to audio (TTS Provider)
     Output: MP3/WAV stored in object storage
  3. Queue outbound call (BullMQ/RabbitMQ job)
  4. Place call (Twilio/Vonage) → stream audio when answered
  5. Record call outcome: answered | voicemail | no-answer | busy
  6. Store recording URL + transcript in activity log
  7. Update lead status + campaign analytics
```

#### E.4 Individual AI Voice Call (From Lead Page)
```
Staff clicks "AI Voice Call" button on lead →
  → AI generates personalized script based on lead data
  → TTS converts to audio (ElevenLabs voice)
  → Call placed via Twilio to lead's phone number
  → Audio plays when lead answers
  → Recording + transcript saved to lead timeline
```

---

### MODULE F: Template System

#### F.1 Template Types
- **Email Templates** — HTML with drag-and-drop builder, supports merge tags
- **SMS Templates** — Plain text with merge tags `{{first_name}}`, `{{company}}`
- **WhatsApp Templates** — WhatsApp-approved format (header, body, footer, buttons)
- **Voice Script Templates** — Text scripts for TTS conversion with pronunciation hints

#### F.2 AI Template Generation
```
User clicks "Generate with AI":
  → Selects: Purpose (Cold outreach | Follow-up | Appointment | Re-engagement)
  → Selects: Tone (Professional | Friendly | Urgent | Empathetic)
  → Selects: Channel (Email | SMS | WhatsApp | Voice Script)
  → AI generates: Subject + Body + CTA
  → User edits → saves as named template
```

#### F.3 Merge Tags (Personalization)
```
Lead fields:    {{lead.first_name}} {{lead.last_name}} {{lead.company}} {{lead.phone}}
Deal fields:    {{deal.value}} {{deal.stage}} {{deal.title}}
Agent fields:   {{agent.name}} {{agent.phone}} {{agent.email}}
System fields:  {{date.today}} {{company.name}} {{company.phone}}
Custom fields:  {{custom.field_name}}
```

---

### MODULE G: Credential Vault & Feature Gating (NEW — Critical)

#### G.1 Per-Tenant Credential Store
Each admin tenant configures their own service credentials:
```
credential_type  : AI | TTS | CALL | SMS | WHATSAPP | EMAIL
provider         : openai | google | anthropic | elevenlabs | polly | twilio | vonage | etc.
credentials      : JSON (AES-256 encrypted at rest)
is_active        : boolean
last_tested_at   : timestamp
test_status      : OK | FAILED | UNTESTED
```

#### G.2 Feature Gating Engine
```typescript
// Pseudo-code
const features = await credentialService.getEnabledFeatures(tenantId);
// Returns: { email, sms, whatsapp, call, aiText, aiVoice, socialFacebook, ... }

// Applied in:
// - Lead detail page (show/hide channel buttons)
// - Campaign type selector (show/hide campaign tabs)
// - Admin settings navigation (show/hide sections)
```

#### G.3 Credential Setup Wizard (Step-by-Step)
For each credential type:
1. Select provider from list
2. Enter required fields (masked/password inputs)
3. Click "Test Connection" → validates credentials with provider API
4. See status: ✅ Connected | ❌ Failed (with reason)
5. Save if test passes

---

### MODULE H: Deals & Pipeline

#### H.1 Lead-to-Deal Conversion
```
Lead detail page → "Convert to Deal" button (admin configures which statuses can convert)
  → Pre-fills deal form: lead name, company, phone, email
  → Staff adds: deal title, value, expected close date, pipeline, stage
  → Deal created and linked to lead record (lead_id stored on deal)
  → Lead status changes to CONVERTED
  → Activity logged on both lead and deal
```

#### H.2 Deal Kanban Board
- Drag-and-drop cards between stages
- Stage summary: deal count + total value
- Card shows: title, contact name, value, assigned staff, last activity date
- Double-click card to open Deal Detail Drawer

#### H.3 Deal Detail Drawer (Side Panel)
- All contact info
- Communication history (linked from lead + direct)
- Activity timeline with notes
- File attachments (proposals, contracts)
- AI health score + recommended next action
- "Won" / "Lost" quick-action buttons
- Revenue forecast contribution

#### H.4 Pipeline Configuration (Admin)
- Admin can create multiple pipelines (e.g., "Sales", "Renewals", "Upsells")
- Each pipeline has customizable stages with:
  - Stage name
  - Color
  - Win probability %
  - Required fields before advancing

---

### MODULE I: Analytics & Reporting

#### I.1 Main Dashboard KPIs
- Total Leads (with trend vs last period)
- Leads by Source (pie chart)
- Lead Conversion Rate
- Active Deals + Pipeline Value
- Revenue Won (current period)
- Campaign Performance Summary

#### I.2 Staff Performance Dashboard
- Leads assigned / contacted / converted per staff
- Calls made / emails sent / messages sent
- Deal won rate per staff
- Average response time to new lead
- Leaderboard view

#### I.3 Campaign Analytics Dashboard
- Campaign list with status, type, target count
- Per-campaign drill-down: delivery, open, click, reply metrics
- Voice campaign: answer rate, voicemail rate, duration avg
- ROI calculator: leads generated vs deals won from campaign

#### I.4 Report Export
- CSV export for leads, deals, activities
- PDF export for campaign performance reports
- Schedule automated reports via email (weekly/monthly)

---

### MODULE J: Automation Engine

#### J.1 Trigger Types
- New lead created (any source)
- Lead status change
- Lead not contacted in X hours
- Deal stage change
- AI score crosses threshold (e.g., score > 80)
- Campaign event (opened email, clicked link)
- Scheduled (date/time based)

#### J.2 Action Types
- Send Email (using template)
- Send SMS (using template)
- Send WhatsApp (using template)
- Assign to staff (round-robin or specific)
- Add tag to lead
- Change lead status
- Create task for staff
- Add to campaign
- Trigger webhook (external notification)
- AI generate draft response

#### J.3 Visual Workflow Builder
- Drag-and-drop nodes: Trigger → Condition → Action
- Branch logic: if/else conditions
- Delay nodes (wait 2 hours, then...)
- Loop prevention (max runs per lead per day)

---

### MODULE K: Super Admin Panel

#### K.1 Tenant Management Table
- All tenants with: name, plan, status, expiry date, staff count, lead count
- Actions: View, Impersonate, Extend, Suspend, Cancel, Reset Password
- Search + filter by plan, status, expiry, creation date
- Export to CSV

#### K.2 Impersonation
```
Super Admin clicks "Impersonate" on tenant row →
  → System generates a temporary impersonation token
  → Super Admin is redirected to that tenant's dashboard
  → Banner shown: "You are impersonating [TenantName]. Click to exit."
  → Session expires when exit button clicked or after 30 minutes
```

#### K.3 Platform Branding CMS
- Upload system logo (PNG/SVG)
- Upload system favicon
- Set primary, secondary, accent color
- Edit landing page sections:
  - Hero headline + subtext
  - Features section content
  - Pricing plans (links to plan manager)
  - Testimonials
  - Footer links + copyright

#### K.4 Subscription Warning Emails
- 14 days before expiry: warning email sent automatically
- 3 days before expiry: urgent warning email
- On expiry: account suspended with grace period message
- All email templates configurable by Super Admin

---

### MODULE L: Subdomain Provisioning & Custom Domain

#### L.1 Subdomain Auto-Provisioning on Subscription
When an admin subscribes and payment is confirmed:
```
Payment confirmed → payment-service emits event →
  → tenant-service receives event
  → Auto-generate subdomain slug from business name:
      "Acme Corp" → "acme-corp.yourdomain.com"
      Collision check: if taken → append random suffix "acme-corp-x4f2"
  → Store in Tenant.customDomain = "acme-corp.yourdomain.com"
  → Send welcome email with:
      - Subdomain URL
      - Login credentials (random password)
      - Link to change password
      - Guide: how to connect own domain
```

#### L.2 Wildcard DNS Setup (Infrastructure)
The platform requires a single wildcard DNS record:
```
*.yourdomain.com  →  CNAME  →  your-server-IP-or-load-balancer
```
The API Gateway reads the `Host` header on every request:
```typescript
// api-gateway middleware
const host = req.headers.host; // e.g. "acme-corp.yourdomain.com"
const slug = host.split('.')[0]; // "acme-corp"
const tenant = await tenantService.findBySlug(slug);
req.tenantId = tenant.id; // injected into all downstream requests
```

#### L.3 Custom Domain Connection (Admin Self-Service)
Admin can connect their own domain from Settings > Domain:

**Step 1 — Admin enters their domain** (e.g. `crm.acmecorp.com`)

**Step 2 — System shows required DNS records:**
```
Type   : CNAME
Name   : crm  (or @)
Value  : acme-corp.yourdomain.com
TTL    : 3600
```

**Step 3 — Admin adds record at their DNS provider** (GoDaddy, Cloudflare, etc.)

**Step 4 — Admin clicks "Verify Domain" button:**
```
→ Server performs DNS lookup on submitted domain
→ Checks if CNAME resolves to platform subdomain
→ If verified: save customDomain in Tenant record
→ SSL certificate auto-provisioned via Let's Encrypt (certbot)
→ Nginx/Caddy reloads to serve domain
→ Success email sent to admin
```

**Step 5 — Domain active:** Admin's custom domain now serves the CRM

#### L.4 Domain Verification States
```
UNVERIFIED  → domain entered but DNS not configured yet
PENDING     → DNS verification in progress (polling every 5 min)
ACTIVE      → domain verified and SSL provisioned
FAILED      → DNS mismatch or SSL error
EXPIRED     → SSL cert needs renewal (auto-handled by certbot cron)
```

#### L.5 DB Schema for Domain
```prisma
// Add to Tenant model:
customDomain         String?  @unique @map("custom_domain")
domainVerified       Boolean  @default(false) @map("domain_verified")
domainVerifiedAt     DateTime? @map("domain_verified_at")
domainStatus         String   @default("UNVERIFIED") @map("domain_status")
subdomain            String   @unique @map("subdomain") // auto-generated on signup
sslExpiresAt         DateTime? @map("ssl_expires_at")
```

#### L.6 Nginx Configuration Template (Auto-Generated per Tenant)
```nginx
# Generated for tenant: acme-corp
server {
    listen 443 ssl;
    server_name acme-corp.yourdomain.com crm.acmecorp.com;
    ssl_certificate /etc/letsencrypt/live/crm.acmecorp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.acmecorp.com/privkey.pem;
    location / {
        proxy_pass http://localhost:3000; # Next.js admin panel
        proxy_set_header Host $host;
        proxy_set_header X-Tenant-Subdomain acme-corp;
    }
}
```

---

### MODULE M: Background Job Architecture

> **Rule:** Any operation taking >2 seconds or affecting multiple records MUST be a background job. Never block an HTTP request for heavy work.

#### M.1 Job Queue Technology
- **Queue:** BullMQ (Redis-backed) — already partially in use by import-service
- **Redis:** Single Redis instance shared across all services
- **Dashboard:** Bull Board UI at `/admin/queues` (Super Admin only)
- **Retry Strategy:** Exponential backoff — 1s, 5s, 30s, 5min, 30min

#### M.2 Queue Inventory (All Background Jobs)

| Queue Name | Service | Trigger | Max Concurrency |
|---|---|---|---|
| `import.process` | import-service | CSV upload | 2 per tenant |
| `campaign.email` | marketing-service | Campaign launch | 5 global |
| `campaign.sms` | marketing-service | Campaign launch | 5 global |
| `campaign.whatsapp` | marketing-service | Campaign launch | 3 global |
| `campaign.voice` | voice-service | Campaign launch | 2 global |
| `lead.ingest` | marketing-service | Webhook received | 10 global |
| `lead.notify` | notification-service | New lead assigned | 20 global |
| `domain.verify` | tenant-service | Domain submit | 5 global |
| `ssl.provision` | tenant-service | Domain verified | 2 global |
| `report.generate` | analytics-service | Scheduled/manual | 3 global |
| `email.send` | communication-service | Any email trigger | 10 global |
| `subscription.check` | tenant-service | Daily cron | 1 global |
| `analytics.aggregate` | analytics-service | Hourly cron | 1 global |

#### M.3 Scheduled Jobs (Cron)
```typescript
// tenant-service — subscription expiry checker
@Cron('0 9 * * *') // Every day at 9:00 AM UTC
async checkSubscriptionExpiry() {
  // Find tenants expiring in 14 days → send warning email
  // Find tenants expiring in 3 days → send urgent email
  // Find expired tenants → suspend + send expired email
}

// marketing-service — campaign processor
@Cron('* * * * *') // Every minute
async processPendingCampaigns() {
  // Find PENDING campaigns where scheduledAt <= now()
  // Push each to appropriate queue (campaign.email / campaign.sms etc.)
}

// analytics-service — hourly data aggregation
@Cron('0 * * * *') // Every hour
async aggregateMetrics() {
  // Pull from crm-service, communication-service, marketing-service
  // Store rolled-up metrics in analytics DB
}

// tenant-service — daily SSL renewal check
@Cron('0 3 * * *') // Every day at 3:00 AM UTC
async checkSslExpiry() {
  // Find domains where sslExpiresAt < 30 days from now
  // Trigger certbot renewal job
}
```

#### M.4 Error Handling Strategy
```typescript
// Standard job error handler pattern for ALL queues:
@OnWorkerEvent('failed')
async onFailed(job: Job, error: Error) {
  this.logger.error(`Job ${job.name}#${job.id} failed: ${error.message}`);
  
  // After max retries exhausted:
  if (job.attemptsMade >= job.opts.attempts) {
    // 1. Mark parent record as FAILED with error message
    await this.markAsFailed(job.data, error.message);
    // 2. Send alert notification to admin
    await this.notifyAdminOfFailure(job.data.tenantId, job.name, error.message);
    // 3. Log to audit trail
    await this.auditLog(job.data.tenantId, 'JOB_FAILED', { job: job.name, error: error.message });
  }
}

// All processors use dead-letter queue for unrecoverable failures
const worker = new Worker(queueName, processor, {
  connection: redisConnection,
  concurrency: 5,
  limiter: { max: 100, duration: 60000 }, // 100 jobs/min rate limit
});
```

#### M.5 Import Service — Enhanced Error Handling
```
CSV Upload → validation check → enqueue job →
  Worker processes row-by-row:
    - Validate required fields (name, phone or email)
    - Normalize phone to E.164
    - Check duplicate (phone + email against CRM)
    - On duplicate: skip + log in errorLog JSON
    - On validation fail: skip + log reason
    - On success: POST to crm-service /contacts
  After all rows:
    - Update ImportJob: successRows, failedRows, status=COMPLETED
    - Send email summary to admin: "Import complete: 450 added, 12 duplicates, 3 errors"
    - Downloadable error report (CSV of failed rows with reasons)
```

#### M.6 Campaign Processor — Enhanced Error Handling
```
Campaign launch → status=RUNNING → push to queue →
  Worker processes lead-by-lead (in batches of 50):
    - Fetch lead details from crm-service
    - Render template with merge tags
    - Send via provider (email/sms/whatsapp/voice)
    - Record: sentCount++ OR failedCount++
    - Update campaign progress every 10 leads
  Rate limiting:
    - Email: max 100/min (configurable per SMTP provider)
    - SMS: max 50/min
    - WhatsApp: max 20/min (Meta rate limit)
    - Voice: max 10/min (telecom limits)
  On provider error (5xx):
    - Retry with backoff (max 3 times per lead)
    - After 3 fails: mark lead as FAILED, continue to next
  On completion:
    - status=COMPLETED, record analytics
    - Send admin email: "Campaign complete: 980 sent, 20 failed"
    - Failed leads downloadable as CSV
```

#### M.7 Notification Service Architecture
```
Notification Types:
  - IN_APP    → stored in auth-service Notification model, SSE push
  - EMAIL     → queued to email.send queue
  - WHATSAPP  → queued to campaign.whatsapp queue (if configured)

Trigger events (all async via queue):
  - New lead assigned     → notify assigned staff
  - Lead status changed   → notify admin
  - Campaign completed    → notify admin
  - Import finished       → notify user who uploaded
  - Domain verified       → notify admin
  - Subscription expiring → notify admin
  - Job failed            → notify admin

SSE (Server-Sent Events) for real-time in-app:
  GET /notifications/stream → keeps connection open
  Server pushes events as new notifications arrive
  Frontend badge auto-updates without polling
```

---

### MODULE N: Payment Custom Link System

#### N.1 Overview
Super Admin or the system can generate a custom, shareable payment link for any subscription plan. This link can be:
- Sent via email directly to a prospect
- Embedded on the landing page as a "Buy Now" button
- Shared manually via WhatsApp/email
- Set to expire after a date or after first use

#### N.2 Payment Link Types
| Type | Description | Use Case |
|---|---|---|
| **Plan Link** | Fixed link for a specific plan | Landing page pricing buttons |
| **Custom Offer Link** | Custom price, custom duration | Special discount for a prospect |
| **Renewal Link** | Sent to expiring admin | Subscription renewal |
| **Trial Link** | Gives X days free trial | Lead conversion |
| **Affiliate Link** | Tracked to reseller/affiliate | Reseller commissions |

#### N.3 Payment Link Flow
```
Super Admin creates payment link:
  → Selects: plan, custom price (optional), expiry date, max uses (1 or unlimited)
  → System generates unique token: crm.yourdomain.com/pay?token=abc123xyz
  → Super Admin copies link / clicks "Send via Email"

Prospect clicks link:
  → System validates: token exists, not expired, uses < maxUses
  → Shows checkout page with: plan details, price, payment form
  → Prospect fills: name, email, business name, payment details
  → Payment processed via configured gateway (Stripe/PayPal/SSLCommerz)
  → On success:
      1. Auto-create tenant record
      2. Auto-generate subdomain (slug from business name)
      3. Auto-create admin user with random password
      4. Send welcome email with credentials + subdomain URL
      5. Mark payment link as used
      6. If affiliate link: record commission event
```

#### N.4 DB Schema
```prisma
model PaymentLink {
  id           String    @id @default(uuid())
  token        String    @unique // URL-safe random token
  type         String    // PLAN | CUSTOM | RENEWAL | TRIAL | AFFILIATE
  planId       String?   @map("plan_id")
  planName     String?   @map("plan_name")
  customPrice  Float?    @map("custom_price") // null = use plan price
  currency     String    @default("USD")
  durationDays Int?      @map("duration_days") // null = plan default
  description  String?   // Custom message shown on checkout page
  maxUses      Int       @default(1) @map("max_uses") // -1 = unlimited
  usedCount    Int       @default(0) @map("used_count")
  affiliateId  String?   @map("affiliate_id") // reseller/affiliate user
  commissionPct Float?   @map("commission_pct")
  expiresAt    DateTime? @map("expires_at")
  isActive     Boolean   @default(true) @map("is_active")
  createdBy    String    @map("created_by") // super admin user ID
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  uses PaymentLinkUse[]
  @@map("payment_links")
}

model PaymentLinkUse {
  id          String   @id @default(uuid())
  linkId      String   @map("link_id")
  tenantId    String   @map("tenant_id") // created tenant
  invoiceId   String?  @map("invoice_id")
  usedAt      DateTime @default(now()) @map("used_at")

  link PaymentLink @relation(fields: [linkId], references: [id])
  @@map("payment_link_uses")
}

model AffiliateCommission {
  id           String   @id @default(uuid())
  affiliateId  String   @map("affiliate_id")
  linkId       String   @map("link_id")
  tenantId     String   @map("tenant_id")
  amount       Float
  currency     String   @default("USD")
  status       String   @default("PENDING") // PENDING | PAID | CANCELLED
  createdAt    DateTime @default(now()) @map("created_at")
  paidAt       DateTime? @map("paid_at")
  @@map("affiliate_commissions")
}
```

#### N.5 Checkout Page UI
```
GET /pay?token=abc123xyz

Page shows:
  ┌─────────────────────────────────┐
  │  [Platform Logo]                │
  │  Business Growth CRM            │
  │  ─────────────────────────────  │
  │  Growth Plan — $79/mo           │
  │  ✓ 5 Staff   ✓ 5,000 Leads     │
  │  ✓ WhatsApp  ✓ Email Campaigns  │
  │                                 │
  │  [Name field]                   │
  │  [Email field]                  │
  │  [Business Name field]          │
  │  [Phone field]                  │
  │  ─────────────────────────────  │
  │  [Card Number]  [MM/YY]  [CVV] │
  │                                 │
  │  [Complete Purchase — $79]      │
  │  🔒 Secured by Stripe           │
  └─────────────────────────────────┘
```

#### N.6 Email Notifications on Payment Link Use
1. **To new admin:** Welcome email with subdomain, credentials, getting-started guide
2. **To super admin:** New subscription alert with tenant details and revenue
3. **To affiliate (if set):** Commission earned notification with amount

---

### MODULE O: Security Architecture

#### O.1 Authentication
- JWT (15-minute access token) + Refresh Token (7-day, rotated on use)
- Bcrypt password hashing (12 rounds)
- Account lockout after 5 failed attempts
- Two-Factor Authentication (TOTP — Google Authenticator) [Future]

#### O.2 Multi-Tenant Data Isolation
- Every database query filtered by `tenant_id`
- PostgreSQL Row Level Security (RLS) as database-level protection
- API Gateway reads `Host` header → resolves tenant by subdomain or custom domain
- Fallback: `x-tenant-id` header for internal service-to-service calls

#### O.3 Role-Based Access Control (RBAC)
- System roles: SUPER_ADMIN | ADMIN | STAFF
- Custom roles per tenant with permission strings (e.g., `leads:read`, `deals:write`)
- Permission check on every API endpoint via NestJS Guards
- Menu-level access control on frontend via permission check hooks

#### O.4 Credential Security
- All API keys, secrets, tokens stored encrypted (AES-256)
- Never returned to frontend in plaintext (show masked ******* with option to reveal)
- Stored in dedicated `credential-service` database
- Vault audit log: who accessed what credentials, when
- Payment link tokens: cryptographically random (32-byte hex), single-use by default

---

## 6. DEVELOPMENT ROADMAP

### Phase 1 — Foundation (DONE ~60%)
- [x] Auth service (JWT, RBAC, custom roles)
- [x] Tenant service (multi-tenant, plans, branding)
- [x] CRM core (contacts, deals, pipeline, activities, tasks)
- [x] Basic communication (email, conversation inbox)
- [x] Marketing service (social connect, campaigns scaffold)
- [x] AI service (chat, lead scoring, recommendations)
- [x] Import service (CSV upload, job tracking)
- [x] Payment service (Stripe, invoices, subscriptions)
- [x] Admin panel (dashboard, leads, deals, settings)
- [x] Super Admin (tenants table, impersonation, branding)

### Phase 2 — Social Lead Engine (Sprint 1-2)
- [ ] Complete Facebook Lead Ads webhook → real lead data fetch
- [ ] Instagram lead ads integration
- [ ] LinkedIn Lead Gen Forms integration
- [ ] TikTok lead ads integration
- [ ] Duplicate detection engine
- [ ] Lead assignment engine (round-robin, skill, territory)
- [ ] Lead activity timeline (all channels in one view)
- [ ] Conditional channel buttons (credential-gated)

### Phase 3 — Credential Vault & Feature Gating (Sprint 3)
- [ ] Build `credential-service` with AES-256 encryption
- [ ] Credential setup wizard UI
- [ ] Test-connection endpoint per service type
- [ ] Feature gating hook (React) for conditional UI
- [ ] Apply feature gates to: leads page, campaigns page, communication hub

### Phase 4 — Campaign System Completion (Sprint 4-5)
- [ ] SMS campaign processor (connect to SMS gateway)
- [ ] WhatsApp campaign processor (connect to WhatsApp Cloud API)
- [ ] Campaign analytics tracking (opens, clicks, replies)
- [ ] Multi-channel sequence campaigns
- [ ] Campaign template selector with AI generate

### Phase 5 — AI Voice System (Sprint 6-8)
- [ ] Build `voice-service`
- [ ] AI script generation endpoint
- [ ] ElevenLabs TTS integration
- [ ] Google TTS / AWS Polly as alternatives
- [ ] Twilio Voice outbound call integration
- [ ] Pre-recorded audio upload + management
- [ ] Voice campaign processor
- [ ] Call recording storage + transcript generation
- [ ] Activity log entry for voice calls

### Phase 6 — Lead-to-Deal Conversion (Sprint 9)
- [ ] Conversion UI on lead detail page
- [ ] Deal pre-fill from lead data
- [ ] Lead status → CONVERTED on deal creation
- [ ] Linked lead panel on deal detail
- [ ] Customizable pipeline stages (admin)

### Phase 7 — Super Admin Completion (Sprint 10)
- [ ] Subscription expiry automated emails (14-day, 3-day, expiry)
- [ ] Admin ban/unban with reason
- [ ] Impersonation session with banner + expiry timer
- [ ] Platform branding CMS (full landing page edit)
- [ ] Platform analytics dashboard (MRR, churn, tenant growth)
- [ ] Announcement broadcast system

### Phase 8 — Analytics Completion (Sprint 11)
- [ ] Build real `analytics-service` (currently stub)
- [ ] Staff performance dashboard
- [ ] Campaign analytics dashboard
- [ ] Revenue forecasting (weighted pipeline)
- [ ] Automated email reports (weekly/monthly)

### Phase 9 — Polish & Launch (Sprint 12-13)
- [ ] Mobile responsive final audit (all 5 breakpoints)
- [ ] Landing page (pricing, features, testimonials, CTA)
- [ ] Onboarding email sequences for new subscribers
- [ ] Public API documentation
- [ ] Load testing (k6 or Artillery)
- [ ] Security audit (OWASP Top 10)
- [ ] Reseller/white-label setup wizard

---

## 7. GO-TO-MARKET STRATEGY

### Primary Target
- **Digital Marketing Agencies** (one agency = 10-50 CRM clients, massive LTV)
- **Real Estate Brokers** (high-volume lead management, WhatsApp-native)
- **Insurance Agencies** (long nurture cycles, great fit for campaigns)
- **Coaching/Course Creators** (social leads from TikTok/Instagram)

### Unique Selling Proposition
> *"The only CRM that captures leads directly from your social ads, assigns them to staff, contacts them via AI voice calls, and tracks every deal — all in one platform."*

### Pricing Advantages
- **GoHighLevel**: $297/mo (limited white-label)
- **HubSpot**: $800+/mo
- **Your CRM**: $79-$199/mo with better AI and BYOC (Bring Your Own Credentials)

### Launch Channels
1. **AppSumo Lifetime Deal** — $50k-$500k in 30 days, builds user base
2. **Product Hunt** — Tech early adopters, press, testimonials
3. **Facebook/LinkedIn Ads** — Target agency owners and CRM buyers
4. **Cold Email to Agencies** — Scraped from Clutch.co and LinkedIn
5. **YouTube Demo Content** — "How I automate social leads with this CRM"

### Reseller Program
- **Affiliate**: 30-40% recurring commission via PartnerStack
- **White-Label Reseller**: $499/mo flat, resell under own brand
- **Integration Partners**: Zapier/Make.com native integration for discovery

---

*End of CRM Master Plan v3.0*
