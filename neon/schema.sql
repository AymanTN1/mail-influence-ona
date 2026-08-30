-- =====================================================================
-- 🐘 Neon PostgreSQL Database Schema for MailInfluence-ONA
-- =====================================================================

DROP TABLE IF EXISTS ona_recommendations CASCADE;
DROP TABLE IF EXISTS ona_audit_reports CASCADE;
DROP TABLE IF EXISTS ona_bus_factor_risks CASCADE;
DROP TABLE IF EXISTS ona_boundary_spanners CASCADE;
DROP TABLE IF EXISTS ona_departments CASCADE;
DROP TABLE IF EXISTS email_interactions CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- 1. Table des Employés & Métriques Individuelles ONA
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    page_rank DOUBLE PRECISION DEFAULT 0.0,
    betweenness DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Interactions / Flux d'Emails (Arêtes du Graphe)
CREATE TABLE email_interactions (
    id SERIAL PRIMARY KEY,
    sender_email VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    weight DOUBLE PRECISION DEFAULT 1.0,
    subject_tag VARCHAR(100) DEFAULT 'General',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sender ON email_interactions(sender_email);
CREATE INDEX idx_recipient ON email_interactions(recipient_email);

-- 3. Table des Métriques de Silos Départementaux
CREATE TABLE ona_departments (
    department_name VARCHAR(100) PRIMARY KEY,
    member_count INT NOT NULL DEFAULT 0,
    internal_flux DOUBLE PRECISION DEFAULT 0.0,
    external_flux DOUBLE PRECISION DEFAULT 0.0,
    isolation_score DOUBLE PRECISION DEFAULT 0.0,
    is_silo BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Collaborateurs en Risque de Surcharge (Bus Factor)
CREATE TABLE ona_bus_factor_risks (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    in_flux DOUBLE PRECISION DEFAULT 0.0,
    out_flux DOUBLE PRECISION DEFAULT 0.0,
    overload_score DOUBLE PRECISION DEFAULT 0.0,
    is_critical BOOLEAN DEFAULT FALSE,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des Nœuds Passerelles (Boundary Spanners / Connecteurs)
CREATE TABLE ona_boundary_spanners (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    betweenness DOUBLE PRECISION DEFAULT 0.0,
    external_depts_count INT DEFAULT 0,
    bridge_score DOUBLE PRECISION DEFAULT 0.0,
    is_key_broker BOOLEAN DEFAULT FALSE,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Rapports d'Audit & Santé Organisationnelle (Historique)
CREATE TABLE ona_audit_reports (
    id SERIAL PRIMARY KEY,
    health_score DOUBLE PRECISION NOT NULL,
    grade VARCHAR(10) NOT NULL,
    density DOUBLE PRECISION NOT NULL,
    reciprocity DOUBLE PRECISION NOT NULL,
    cross_dept_connectivity DOUBLE PRECISION NOT NULL,
    resilience_score DOUBLE PRECISION NOT NULL,
    executive_summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des Recommandations Stratégiques RH
CREATE TABLE ona_recommendations (
    id SERIAL PRIMARY KEY,
    report_id INT REFERENCES ona_audit_reports(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL
);
