-- CRM SaaS Platform — PostgreSQL Initialization Script
-- Creates separate databases for each microservice

CREATE DATABASE crm_auth_db;
CREATE DATABASE crm_tenant_db;
CREATE DATABASE crm_core_db;
CREATE DATABASE crm_communication_db;
CREATE DATABASE crm_marketing_db;
CREATE DATABASE crm_payment_db;
CREATE DATABASE crm_analytics_db;

-- Grant all privileges to the main user
GRANT ALL PRIVILEGES ON DATABASE crm_auth_db TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_tenant_db TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_core_db TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_communication_db TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_marketing_db TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_payment_db TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE crm_analytics_db TO crm_user;
