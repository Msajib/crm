# CRM SaaS Platform — System Planning Document

> **Document Version:** 2.0 (April 2026 Update)  
> **Prepared By:** Senior Software Architect  
> **Status:** Initial Release Ready
> **Architecture Pattern:** Service-Oriented Architecture (SOA) + Microservices (Hybrid)

---

## 1. Executive Summary

This document defines the requirements for a **Next-Generation AI-Driven CRM SaaS Platform**. Designed for the 2026 market, this system goes beyond traditional record-keeping by integrating autonomous AI agents, the Model Context Protocol (MCP), and a multi-channel communication engine into a single, highly responsive ecosystem.

### Key Highlights
*   **AI Sales Agent**: Autonomous assistant that scores leads, generates personalized outreach, and recommends next actions 24/7.
*   **MCP Protocol Support**: Industry-first Model Context Protocol server for AI tool interoperability and external agent integration.
*   **Multi-Model AI**: Native support for **Gemini 2.5**, **GPT-5**, and **Claude 3.5** — no vendor lock-in.
*   **Setup Wizard**: Guided 4-step production setup wizard for self-hosted or cloud deployments.
*   **Fully Responsive**: Five-tier responsive design (1400/1024/768/390/320px) with adaptive sidebar and mobile bottom nav.
*   **Security First**: Row Level Security (RLS) and 4-tier RBAC protecting every record.

---

## 2. Responsive Design Standards

The platform follows a strict **Five-tier Breakpoint System** to ensure a premium experience across all devices.

| Breakpoint | Target Device | Sidebar Mode | Navigation |
|---|---|---|---|
| **> 1400px** | Ultrawide / Desktop | Full Expanded | Standard Sidebar |
| **1024px - 1399px** | Laptop / Tablet (L) | Icon-only Mini | Standard Sidebar |
| **768px - 1023px** | Tablet (P) | Off-canvas Drawer | Hamburger + Mini |
| **390px - 767px** | Mobile (Large) | Hidden | Touch-optimized Bottom Nav |
| **< 390px** | Mobile (Small) | Hidden | Touch-optimized Bottom Nav |

*   **Adaptive Grids**: Card stacking and flexible layouts ensure data density remains readable.
*   **Touch Optimization**: Large hit targets and swipe gestures for mobile users.

---

## 3. Feature Modules & Requirements

### 3.1 AI Ecosystem
#### AI Sales Assistant
*   **Streaming Chat Interface**: Real-time AI responses with markdown rendering.
*   **Conversation Memory**: Persistent chat history across sessions.
*   **Context-Aware**: Suggestions based on live CRM data (Deals, Contacts).
*   **Multi-Model Support**: Support for Gemini, GPT-5, Claude, and custom OpenAI-compatible endpoints.

#### AI Agent Center
*   **Autonomous Lead Scoring**: AI analyzes engagement data to rank leads automatically.
*   **Outreach Generation**: Personalized email/message drafts based on contact profiles.
*   **Deal Health Analysis**: Recommendations for "next-best actions" for every deal.
*   **Decision Pipelines**: AI decision-making within automation workflows.

### 3.2 MCP Protocol (Model Context Protocol)
*   **MCP Server**: Exposes CRM data (Contacts, Deals, Activities) as resources for AI tool interoperability.
*   **Tools**: Full CRUD operations on all CRM entities via MCP tool calls.
*   **Request Tracing**: Full audit trail of MCP requests with timing and error tracking.
*   **Resource Subscriptions**: Real-time notifications for data changes to external agents.

### 3.3 CRM Core: Contact Management
*   **Lifecycle Tracking**: New Lead → Engaged → Qualified → Proposal → Customer → Churned.
*   **Advanced Filtering**: Filter by status, tags, source, AI score, and custom fields.
*   **Bulk Actions**: Tag, status change, delete, or export multiple contacts at once.
*   **CSV Import**: Intelligent field mapping for bulk uploads.
*   **Contact Detail Page**: 360-degree view with timeline, notes, deals, and file attachments.
*   **File Attachments**: Secure document storage linked directly to contact records.

### 3.4 Sales Pipeline & Deals
*   **Kanban Board**: Visual drag-and-drop pipeline with 5 stages (Discovery, Proposal, Negotiation, Won, Lost).
*   **Deal Analytics**: Value, probability, and expected close date tracking.
*   **Deal Detail Drawer**: Side-panel for quick updates without context switching.
*   **Win/Loss Analysis**: Conversion rate charts and stage-by-stage funnel visualization.

### 3.5 Multi-Channel Communication Hub
*   **Omni-channel Messaging**: Email, SMS, and WhatsApp in a single unified interface.
*   **AI-Generated Drafts**: Contextual message generation based on contact history.
*   **Email Sequences**: Multi-step automated campaigns with enrollment tracking.
*   **Timezone Awareness**: Scheduled sending optimized for contact location.

### 3.6 Analytics Dashboard
*   **Real-Time KPIs**: Total Contacts, Active Deals, Won Revenue, Pipeline Value with trend indicators.
*   **Revenue by Stage**: Stacked bar chart showing deal value distribution.
*   **Activity Timeline**: Area chart tracking team activity over time.
*   **Chart Export**: One-click export of any chart to PDF or PNG.

### 3.7 Automation Engine
*   **Visual Wizard**: No-code builder for multi-step workflows.
*   **5 Triggers**: Status Change, New Contact, Score Threshold, Scheduled, Deal Stage Change.
*   **Actions**: Send Email, Update Status, Add Tag, AI Generate, Assign Score.
*   **Cron Scheduling**: Server-side execution via edge functions for precision.

### 3.8 Webhook System
*   **Inbound Processing**: Accept and process events from any external service.
*   **Automatic Retry**: Exponential backoff logic for failed deliveries.
*   **Payload Inspection**: Full detail view of every webhook event and its processing status.

---

## 4. Security & Access Control

### 4.1 Four-Tier RBAC System
| Role | Access Level | Responsibilities |
|---|---|---|
| **Super Admin** | Platform-Wide | Global system settings, tenant management, platform branding. |
| **Admin** | Tenant-Wide | User management, billing, custom domains, workspace branding. |
| **Moderator (Agent)** | Operational | Automations, webhooks, AI agent configuration, MCP, settings. |
| **User** | Functional | Core CRM: contacts, deals, pipeline, communications, analytics. |

### 4.2 Security Architecture
*   **Row Level Security (RLS)**: PostgreSQL RLS policies ensure data isolation between tenants.
*   **Vault Storage**: API keys stored in encrypted vaults, never exposed to the client bundle.
*   **Audit Trail**: Comprehensive logging of all actions with user + timestamp.

---

## 5. Roadmap & Release Plan

### Initial Release (April 2026)
- [x] Full CRM with Contacts & Deals Kanban
- [x] AI Sales Agent (Gemini/GPT-5/Claude support)
- [x] MCP Protocol Server & Documentation
- [x] Multi-channel Communication (Email, SMS, WhatsApp)
- [x] Automation Engine with Visual Wizard
- [x] Real-time Analytics Dashboard & Chart Export
- [x] Webhook System with Analytics & Retry Logic
- [x] 4-tier RBAC & RLS Security
- [x] 4-step Setup Wizard for Guided Deployment
- [x] Five-tier Responsive Design (1400/1024/768/390/320px)
- [x] Premium Dark Theme with Semantic Tokens
- [x] CSV Import, Bulk Actions, and Global Search

---
*End of Updated Planning Document v2.0*
