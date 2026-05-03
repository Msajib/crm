# CRM System Audit Report — Codebase vs Master Plan
> **Prepared By:** Senior Software Architect
> **Audit Date:** May 2026
> **Codebase Location:** `/apps/*` (11 microservices + admin-panel)

---

## OVERALL PROJECT COMPLETION: ~42%

```
████████████░░░░░░░░░░░░░░░░  42% Complete
```

---

## MODULE-BY-MODULE AUDIT

---

### ✅ AUTH SERVICE — 85% Complete
**Location:** `apps/auth-service`
**DB:** `crm_auth_db` | Schema: `schema.prisma` (112 lines)

#### What's DONE ✅
- JWT access token (15m) + refresh token (7d) with rotation
- Bcrypt password hashing (12 rounds)
- Login with tenant expiry check via tenant-service call
- Register (auto SUPER_ADMIN for first user, ADMIN for rest)
- Logout (revokes refresh token)
- Token validation endpoint (used by API gateway)
- Change password (revokes all refresh tokens)
- Custom roles: create, read, update, delete with permission sync
- AuditLog model + logging on register/login
- Notification model (structure only)
- `SUPER_ADMIN | ADMIN | STAFF` role enum

#### What's MISSING / NEEDS ADJUSTMENT ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| No impersonation endpoint | 🔴 NEW | Add `POST /auth/impersonate/:tenantId` — Super Admin only, returns temp token |
| No forgot-password / reset-password flow | 🔴 MISSING | Add `POST /auth/forgot-password` → send email link → `POST /auth/reset-password` |
| No account lockout after failed attempts | 🟠 MISSING | Add `failedLoginCount` + `lockedUntil` fields to User model |
| Staff creation by Admin not handled in register | 🟠 ADJUST | Add `POST /auth/create-staff` endpoint for admin-created staff with random password |
| No 2FA (TOTP) | 🟡 FUTURE | Add Google Authenticator support |

#### DB Adjustments Required
```prisma
// Add to User model:
failedLoginCount Int      @default(0) @map("failed_login_count")
lockedUntil      DateTime? @map("locked_until")
mustChangePassword Boolean @default(false) @map("must_change_password")
createdBy        String?  @map("created_by") // who created this staff

// New model needed:
model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  @@map("password_reset_tokens")
}

model ImpersonationSession {
  id           String   @id @default(uuid())
  superAdminId String   @map("super_admin_id")
  targetTenantId String @map("target_tenant_id")
  token        String   @unique
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")
  @@map("impersonation_sessions")
}
```

---

### ✅ TENANT SERVICE — 75% Complete
**Location:** `apps/tenant-service`
**DB:** `crm_tenant_db`

#### What's DONE ✅
- Full Tenant model (name, slug, branding, custom domain, timezone, expiry)
- SystemSetting model (global branding, SMTP templates, colors, logo)
- SystemTemplate model (email templates for system messages)
- Plan model (Starter/Growth/Business/Enterprise with feature flags)
- SocialAccount model (Facebook, Instagram, TikTok connections)
- Tenant CRUD for Super Admin
- Plan management

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| No subscription warning email cron | 🔴 MISSING | Add `@Cron` job: 14-day and 3-day expiry warning emails |
| No ban/unban logic | 🔴 MISSING | Add `bannedAt`, `banReason` to Tenant model + endpoints |
| No MRR/platform analytics endpoint | 🟠 MISSING | Aggregate query across all tenants for Super Admin dashboard |
| LinkedIn, Twitter missing from SocialPlatform enum | 🟠 ADJUST | Add LINKEDIN, TWITTER to enum |
| No announcement broadcast model | 🟡 MISSING | New `Announcement` model + broadcast endpoint |

#### DB Adjustments Required
```prisma
// Add to Tenant model:
bannedAt    DateTime? @map("banned_at")
banReason   String?   @map("ban_reason")

// Update SocialPlatform enum:
enum SocialPlatform {
  FACEBOOK
  INSTAGRAM
  TIKTOK
  LINKEDIN
  TWITTER
  MARKETPLACE
}

// New model:
model Announcement {
  id        String   @id @default(uuid())
  title     String
  message   String   @db.Text
  type      String   @default("INFO") // INFO | WARNING | CRITICAL
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  expiresAt DateTime? @map("expires_at")
  @@map("announcements")
}
```

---

### ✅ CRM SERVICE — 70% Complete
**Location:** `apps/crm-service`
**DB:** `crm_core_db`

#### What's DONE ✅
- Contact model (full with tags, custom fields, status lifecycle, assignedTo)
- Company model
- Pipeline + PipelineStage models (fully customizable)
- Deal model (with won/lost tracking, custom fields)
- Activity model (CALL, EMAIL, SMS, WHATSAPP, MEETING, NOTE, TASK)
- Task model (with priority, checklist, due dates)
- Webhook model (outbound webhooks)
- CRUD for all entities
- Bulk operations
- Advanced filtering on contacts
- Global search

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| Contact status missing CONVERTED, ENGAGED states | 🔴 ADJUST | Add `CONVERTED` and `ENGAGED` to ContactStatus enum |
| No lead source platform field | 🔴 ADJUST | Add `sourcePlatform` String field to Contact (FACEBOOK \| INSTAGRAM etc.) |
| No lead-to-deal conversion endpoint | 🔴 MISSING | `POST /contacts/:id/convert-to-deal` — creates Deal, updates Contact status |
| No `leadId` link on Deal | 🔴 ADJUST | Add `leadId String?` to Deal model linking back to originating lead |
| No duplicate detection on contact create | 🟠 MISSING | Check phone+email before insert, return merge suggestion |
| No AI score field on Contact | 🟠 ADJUST | Add `aiScore Int?` field, populated by ai-service |
| No SLA tracking (not-contacted-in-X-hours) | 🟡 FUTURE | Add `lastContactedAt` field + scheduled check |

#### DB Adjustments Required
```prisma
// Update ContactStatus enum:
enum ContactStatus {
  LEAD
  CONTACTED      // NEW
  ENGAGED        // NEW
  QUALIFIED
  PROSPECT
  CONVERTED      // NEW — replaces CUSTOMER for lead flow
  CUSTOMER
  INACTIVE
  LOST
}

// Add to Contact model:
sourcePlatform String? @map("source_platform") // FACEBOOK | INSTAGRAM | LINKEDIN | TIKTOK | MANUAL | API
sourceCampaignId String? @map("source_campaign_id")
aiScore        Int?    @map("ai_score")
lastContactedAt DateTime? @map("last_contacted_at")
rawPayload     Json?   @map("raw_payload") // original webhook data

// Add to Deal model:
leadId         String? @map("lead_id") // originating contact/lead
convertedAt    DateTime? @map("converted_at")
```

---

### ✅ COMMUNICATION SERVICE — 55% Complete
**Location:** `apps/communication-service`
**DB:** `crm_comm_db`

#### What's DONE ✅
- EmailLog, CallLog models (logging only)
- EmailConfig model (SMTP + API key providers) — per tenant
- Notification model (in-app)
- Conversation + Message models (two-way inbox)
- Email send (real via SMTP/SendGrid using nodemailer)
- Invoice email with PDF attachment
- Conversation inbox (get/reply/notes)
- Notification create + read/mark-read

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| No real SMS sending | 🔴 MISSING | Integrate Twilio SMS / Vonage. Add `SmsLog` model + `sendSms()` method |
| No WhatsApp sending | 🔴 MISSING | Integrate Meta Cloud API. Add `WhatsAppLog` model + `sendWhatsApp()` |
| No AI TTS credential stored here | 🔴 DEFER | Move to `credential-service` (not built yet) |
| Twilio/Voice credentials stored in localStorage on frontend | 🔴 CRITICAL BUG | Must move to DB via credential-service — localStorage is insecure |
| No SMS template support | 🟠 MISSING | Add `SmsTemplate` model (currently only EmailTemplate) |
| No WhatsApp template model | 🟠 MISSING | Add `WhatsAppTemplate` model |
| `CallLog` has no recording URL or transcript | 🟠 ADJUST | Add `recordingUrl`, `transcript`, `aiSummary` to CallLog |
| No bulk send endpoint (used by campaigns) | 🟠 MISSING | Add `POST /communications/bulk-email`, `bulk-sms`, `bulk-whatsapp` |

#### DB Adjustments Required
```prisma
// New models:
model SmsLog {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  from      String
  to        String
  body      String
  status    String   // SENT | FAILED | DELIVERED
  provider  String?  // TWILIO | VONAGE
  createdAt DateTime @default(now()) @map("created_at")
  @@map("sms_logs")
}

model WhatsAppLog {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  to          String
  body        String
  templateName String? @map("template_name")
  status      String   // SENT | DELIVERED | READ | FAILED
  messageId   String?  @map("message_id") // from Meta API
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("whatsapp_logs")
}

// Update CallLog:
model CallLog {
  // ... existing fields +
  recordingUrl  String?  @map("recording_url")
  transcript    String?  @db.Text
  aiSummary     String?  @map("ai_summary")
  provider      String?  // TWILIO | VONAGE | SIP
  direction     String   @default("OUTBOUND") // OUTBOUND | INBOUND
}
```

---

### ✅ MARKETING SERVICE — 50% Complete
**Location:** `apps/marketing-service`
**DB:** `crm_marketing_db`

#### What's DONE ✅
- SocialAccount model (connect/token store)
- SocialCredential model (App ID + App Secret per platform)
- WebhookSubscription model (platform webhook listener registry)
- Campaign model (EMAIL, SMS, CALL, WHATSAPP, SOCIAL)
- `connectSocial()` — store access token
- `saveConfig()` — save App ID/Secret per platform
- `processSocialLead()` — receives webhook → creates CRM contact (PARTIAL — uses dummy data)
- `syncAnalytics()` — real Facebook Page stats fetch (working for FB, mock for others)
- `createPost()` — Facebook post publish (working)
- `sendSocialMessage()` — send Facebook DM (working)
- `processCampaigns()` — cron every minute, EMAIL campaign works end-to-end
- SMS / WhatsApp / CALL campaigns are STUBS (mark complete without doing anything)

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| `processSocialLead()` uses dummy lead data | 🔴 CRITICAL BUG | Call real Facebook Lead API `GET /{leadgen-id}?fields=field_data&access_token=` |
| Instagram lead ingestion not implemented | 🔴 MISSING | Add Instagram Lead Ads webhook handler |
| LinkedIn lead ingestion not implemented | 🔴 MISSING | LinkedIn Marketing API webhook |
| TikTok lead ingestion not implemented | 🔴 MISSING | TikTok Business API |
| SMS campaign processor is a stub | 🔴 MISSING | Connect to communication-service bulk-sms endpoint |
| WhatsApp campaign processor is a stub | 🔴 MISSING | Connect to communication-service bulk-whatsapp endpoint |
| CALL campaign processor is a stub | 🔴 MISSING | Connect to voice-service (not built) |
| No campaign `sentCount`, `openCount`, `clickCount` tracking | 🟠 MISSING | Add analytics fields to Campaign model |
| No audience builder (filter leads for campaign) | 🟠 MISSING | Campaign creation must filter contacts via crm-service |

#### DB Adjustments Required
```prisma
// Update Campaign model:
model Campaign {
  // ... existing fields +
  sentCount      Int  @default(0) @map("sent_count")
  deliveredCount Int  @default(0) @map("delivered_count")
  openCount      Int  @default(0) @map("open_count")
  clickCount     Int  @default(0) @map("click_count")
  replyCount     Int  @default(0) @map("reply_count")
  answeredCount  Int  @default(0) @map("answered_count") // for voice
  audienceFilter Json @default("{}") @map("audience_filter") // filter criteria
}
```

---

### ✅ AI SERVICE — 60% Complete
**Location:** `apps/ai-service`

#### What's DONE ✅
- AIConfiguration model (per tenant or GLOBAL)
- Knowledge base model (upload context docs)
- AIConversation model (chat history)
- OpenAI + Google Gemini providers working
- Chat endpoint with context injection from knowledge base
- Lead scoring (real AI + mock fallback)
- Deal recommendations (real AI + mock fallback)
- Config save/get

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| Claude (Anthropic) provider not implemented | 🟠 MISSING | Add `Anthropic` SDK, handle `ANTHROPIC` provider case |
| No AI template generation endpoint | 🔴 MISSING | `POST /ai/generate-template` with type, purpose, tone → returns content |
| No AI voice script generation endpoint | 🔴 MISSING | `POST /ai/generate-voice-script` → personalized script for TTS |
| No streaming chat (SSE) | 🟡 FUTURE | Use OpenAI streaming API for real-time chat response |
| Conversation history not used in context (single-turn only) | 🟠 ADJUST | Load previous messages from AIConversation and pass to AI |
| AI credentials stored in ai-service DB (should be in credential-service) | 🟠 ARCH NOTE | After credential-service is built, ai-service should query it |

---

### ✅ IMPORT SERVICE — 80% Complete
**Location:** `apps/import-service`

#### What's DONE ✅
- ImportJob model with full status tracking
- CSV parsing with field mapping
- BullMQ job queue processor
- Row-level error logging
- Success/failed counts

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| No duplicate detection during import | 🟠 MISSING | Check phone/email against crm-service before inserting each row |
| No Excel (.xlsx) support, only CSV | 🟡 MISSING | Add `xlsx` npm package |
| No source platform tag on imported contacts | 🟠 ADJUST | Set `sourcePlatform = 'MANUAL'` on all imported contacts |

---

### ✅ PAYMENT SERVICE — 70% Complete
**Location:** `apps/payment-service`

#### What's DONE ✅
- PaymentGatewayConfig model (Stripe, PayPal, SSLCommerz, bKash)
- Subscription model
- Invoice model
- PlanPurchaseEvent model
- Stripe payment intent flow
- Invoice creation
- Subscription activation on payment

#### What's MISSING ⚠️
| Gap | Type | Fix Required |
|---|---|---|
| No PayPal implementation (model exists, no logic) | 🟠 MISSING | Add PayPal SDK integration |
| No SSLCommerz/bKash actual integration | 🟠 MISSING | Local gateway integration for BD market |
| No subscription renewal handling | 🔴 MISSING | On expiry, auto-charge saved payment method or send renewal link |
| No usage-based billing (extra staff/leads/minutes) | 🟡 FUTURE | Metered billing for add-ons |

---

### ✅ ANALYTICS SERVICE — 5% Complete
**Location:** `apps/analytics-service`

#### What's DONE
- Service scaffold only (3 files: app.module, app.controller, main.ts)
- No real logic implemented

#### What's MISSING ⚠️
| Gap | Type | Fix |
|---|---|---|
| No analytics endpoints at all | 🔴 MISSING | Build entirely from scratch |
| Dashboard KPI aggregation | 🔴 MISSING | Query crm-service, payment-service, marketing-service |
| Staff performance metrics | 🔴 MISSING | Aggregate activities per user |
| Campaign analytics aggregation | 🔴 MISSING | Pull from marketing-service campaign stats |
| Revenue forecasting | 🟡 FUTURE | Weighted pipeline value calculation |

---

### 🔴 CREDENTIAL SERVICE — 0% Complete
**Status:** NOT BUILT

This is the most critical missing service. Currently:
- Voice credentials stored in `localStorage` on frontend (SECURITY RISK)
- SMS credentials (Twilio) have no storage at all
- WhatsApp credentials partially stored in communication-service per-tenant

#### Must Build:
```prisma
// New database: crm_credential_db
model TenantCredential {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  type         String   // AI | TTS | CALL | SMS | WHATSAPP | EMAIL
  provider     String   // openai | elevenlabs | twilio | meta | etc.
  credentials  String   @db.Text // AES-256 encrypted JSON
  isActive     Boolean  @default(true) @map("is_active")
  lastTestedAt DateTime? @map("last_tested_at")
  testStatus   String   @default("UNTESTED") // OK | FAILED | UNTESTED
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@unique([tenantId, type, provider])
  @@index([tenantId])
  @@map("tenant_credentials")
}

model FeatureGate {
  id       String  @id @default(uuid())
  tenantId String  @unique @map("tenant_id")
  gates    Json    // { email: true, sms: false, whatsapp: true, call: false, aiVoice: false }
  @@map("feature_gates")
}
```

---

### 🔴 VOICE SERVICE — 0% Complete
**Status:** NOT BUILT

#### Must Build:
```
voice-service responsibilities:
1. POST /voice/generate-script  → calls ai-service, returns text
2. POST /voice/generate-audio   → calls TTS provider (ElevenLabs/Polly), returns audio URL
3. POST /voice/place-call       → calls Twilio/Vonage, plays audio
4. POST /voice/campaign-call    → bulk call for campaign processor
5. GET  /voice/recordings/:id   → fetch call recording URL
6. Webhook: /voice/call-status  → Twilio callback for call outcome
```

---

### ✅ ADMIN PANEL — 58% Complete
**Location:** `apps/admin-panel`

#### Pages Inventory
| Page | Status | Notes |
|---|---|---|
| Login | ✅ Done | JWT, redirect on expiry |
| Dashboard | ✅ Done | KPIs, charts, AI agent panel |
| Leads | ✅ Done | Table, filters, bulk actions |
| Deals / Kanban | ✅ Done | Drag-drop pipeline |
| Communication > Messages | ✅ Done | Conversation inbox |
| Communication > Emails | ✅ Done | Email logs |
| Communication > Calls | ✅ Done | Call logs (no real calling UI) |
| Communication > Templates | ✅ Done | Email template builder |
| Marketing > Social | ✅ Done | Connect FB/IG, view analytics |
| Marketing > Campaigns | ✅ Done | Campaign list + create |
| AI | ✅ Done | Chat, lead scores, recommendations |
| Automation > Campaigns | ✅ Done | Visual workflow builder |
| Automation > Webhooks | ✅ Done | Webhook CRUD |
| Automation > MCP | ✅ Done | MCP protocol panel |
| Settings > Email | ✅ Done | SMTP config |
| Settings > Integrations | ✅ Done | Voice/WhatsApp config (localStorage — needs fixing) |
| Settings > Users | ✅ Done | Staff management + role builder |
| Settings > Payments | ✅ Done | Stripe connect |
| Settings > Subscription | ✅ Done | Plan view |
| Settings > Pipelines | ✅ Done | Pipeline/stage editor |
| Settings > Domain | ✅ Done | Custom domain |
| Super Admin > Tenants | ✅ Done | Tenant table + actions |
| Super Admin > Settings | ✅ Done | Branding, SMTP, plans |
| Super Admin > AI Settings | ✅ Done | Global AI config |
| Lead Detail Page | ❌ MISSING | 360° view with timeline + convert to deal |
| Deal Detail Drawer | ⚠️ Partial | Basic, no linked lead panel |
| Credential Vault UI | ❌ MISSING | Needs credential-service first |
| Voice Call UI (AI) | ❌ MISSING | Needs voice-service first |
| Campaign Analytics Detail | ❌ MISSING | Per-campaign drill-down |
| Staff Performance Reports | ❌ MISSING | Needs analytics-service |
| Impersonation Banner | ❌ MISSING | Shown when Super Admin impersonates |

---

## COMPLETION SUMMARY BY MODULE

| Module | Done | Score |
|---|---|---|
| Auth Service | 85% | ████████░░ |
| Tenant Service | 75% | ███████░░░ |
| CRM Core Service | 70% | ███████░░░ |
| Communication Service | 55% | █████░░░░░ |
| Marketing / Campaign Service | 50% | █████░░░░░ |
| AI Service | 60% | ██████░░░░ |
| Import Service | 80% | ████████░░ |
| Payment Service | 70% | ███████░░░ |
| Analytics Service | 5% | ░░░░░░░░░░ |
| Credential Service | 0% | ░░░░░░░░░░ |
| Voice Service | 0% | ░░░░░░░░░░ |
| Admin Panel (Frontend) | 58% | █████░░░░░ |
| **TOTAL PROJECT** | **~42%** | **████░░░░░░** |

---

## PRIORITY ACTION LIST

### 🔴 P1 — Must Fix (Blockers)
1. **Move voice/SMS credentials OUT of localStorage** → credential-service
2. **Fix `processSocialLead()`** → fetch real data from Facebook Lead API
3. **Build `credential-service`** → encrypted vault + feature gating
4. **Add `CONVERTED` status + `leadId` to Contact/Deal** → required for conversion flow

### 🟠 P2 — High Priority (Core Features)
5. Build `voice-service` (AI script → TTS → Twilio call)
6. Complete SMS/WhatsApp campaign processors in marketing-service
7. Build Lead Detail Page with 360° view and activity timeline
8. Add forgot-password / reset-password flow
9. Add subscription expiry warning cron (14-day, 3-day)
10. Build analytics-service (currently stub only)

### 🟡 P3 — Medium Priority (Enhancements)
11. Add Claude (Anthropic) provider to ai-service
12. Add AI template generation endpoint
13. Add LinkedIn + TikTok lead ingestion
14. Add duplicate detection on lead import
15. Build campaign analytics tracking (open/click/reply counts)

---

*End of CRM System Audit Report — May 2026*
