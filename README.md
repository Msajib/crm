# 🚀 CRM Pro v2.0 - Full-Stack SaaS Platform

Welcome to **CRM Pro**, a production-ready, autonomous SaaS CRM platform. This system has evolved from a UI prototype into a robust microservice architecture powered by **NestJS**, **Next.js**, and **PostgreSQL**.

---

## ✨ Features

- **Microservice Architecture**: Decoupled services for Auth, Tenants, CRM, Communications, Payments, and Analytics.
- **Unified PostgreSQL Database**: All services connect to a single database (`crm_system`) using the `public` schema for simplified management.
- **Real Multi-Tenancy (B2B SaaS)**: Data isolation across organizations powered by a live backend.
- **Production RBAC & Authentication**:
  - **Super Admins**: Global oversight of the entire tenant ecosystem.
  - **Tenant Admins**: Localized control over workspace settings and modules.
- **Hierarchical Feature Toggling**: Real-time module visibility control for both Super Admins and Tenant Admins.
- **Autonomous AI Agent**: Backend integration for lead scoring and deal insights.

---

## 🔑 Login Credentials (Live Production)

The system now uses a real backend authentication service. **Passwords are mandatory and validated.**

- **Super Admin**:
  - **Email**: `super@crm.local`
  - **Password**: `password123`
  - *Access: Global Tenants, Global Modules, System Customization.*
  
- **Tenant Admin**:
  - **Email**: `admin@acme.com`
  - **Password**: `password123`
  - *Access: Localized Workspace, CRM Modules (Contacts, Deals, etc.).*

---

## ⚙️ Setup & Run Process

### 1. Database Initialization
Ensure you have **PostgreSQL 17** running and a database named `crm_system` created. To initialize all service tables and seed the initial users in one command, run:

```bash
# From the project root
npm run db:init
```
*This command runs Prisma generation, syncs schemas to the public namespace, and seeds the admin users.*

### 2. Full System Boot
This project uses **Turborepo** to manage and run all services simultaneously.

```bash
# From the project root
npm run dev
```
*This will boot the API Gateway (3000), Auth Service (3001), Tenant Service (3002), CRM Service (3003), and the Admin Panel (3100).*

### 3. Access the App
Open your browser and navigate to **`http://localhost:3100`**.

---

## 🛠️ Advanced Database Commands

If you need to perform maintenance or reset the system, use these root-level commands:

- **`npm run db:reset`**: Wipes the database, re-syncs all schemas, and re-seeds the initial users. (Use with caution!)
- **`npm run db:seed`**: Re-runs the initial user import.
- **`npm run db:generate`**: Regenerates the Prisma Clients for all microservices.

---

## 🗄️ System Architecture

- **API Gateway (Port 3000)**: The entry point for all frontend requests.
- **Auth Service (Port 3001)**: Handles JWT issuance, RBAC, and user management.
- **Tenant Service (Port 3002)**: Manages organization profiles, subscriptions, and module settings.
- **CRM Service (Port 3003)**: Core logic for Contacts, Deals, Tasks, and Pipelines.
- **Admin Panel (Port 3100)**: The Next.js frontend interface.

---

## 🆘 Support & Resources

- **Technical Specs**: Refer to `CRM_PLANNING_DOCUMENT.md` for the original architecture plan.
- **UI Styling**: Powered by "glass-premium" CSS tokens and modern Tailwind/Vanilla CSS.

## 🔍 Global Search System

The platform features a production-grade Global Search accessible from the topbar (press `/` to focus).

### What you can search:
- **Contacts**: Search by Name or Email.
- **Deals**: Search by Title or Company Name.
- **Tasks**: Search by Task Title.

### How it works:
1. **Frontend**: Uses a debounced (300ms) fetch mechanism to prevent API flooding.
2. **Gateway**: Routes requests to the CRM microservice via `/api/v1/crm/search`.
3. **Backend**: Performs concurrent database queries across three tables (Contacts, Deals, Tasks) and returns a unified result set.
4. **Navigation**: Clicking a result instantly routes you to the relevant dashboard section.

## 📋 Task Management (Kanban)
A production-ready Trello-style board for managing your team's workflow.

### Working Process:
1. **Access**: Navigate to the **Tasks** module in the sidebar.
2. **Kanban View**: Tasks are automatically grouped into **To Do**, **In Progress**, and **Completed** columns.
3. **Create Task**: Click **"Create Task"** to add a new item with priority, due date, and detailed description.
4. **Interactive Checklists**: Descriptions support checkable feature lists for granular progress tracking.
5. **Real-time Updates**: Status changes are instantly persisted to the backend CRM service.

## 📊 Dashboard Personalization (Switchery)
Tailor your experience by choosing which metrics matter most to you.

### Working Process:
1. **Access**: Navigate to **Workspace** -> **Dashboard Stats** in the sidebar.
2. **Toggle Metrics**: Use the **"Statistic Switchery"** to enable or disable cards like Revenue Analytics, Active Deals, or Conversion Rate.
3. **Save**: Click **"Save Configuration"** to persist your preferences.
4. **Instant Reflect**: The main dashboard will instantly update its layout based on your selections.

## 🤖 AI Sales Agent Training
The platform includes an autonomous AI agent that can be trained on your specific business data.

### Training Process:
1. **Access**: Navigate to the **AI Sales Agent** tab in the dashboard.
2. **Knowledge Base**: Click on **"Knowledge Base"** then **"Train Agent"**.
3. **Ingest Data**: Upload or paste the text content from your SOPs, Product Specs, or Pitch Decks.
4. **Autonomous Context**: Once ingested, the AI will automatically search this knowledge base when answering chat queries or analyzing deals, providing context-aware recommendations based on your company's internal policies.

---

**The system is live and ready for deployment.**  
*Powered by CRM Pro v2.0*
