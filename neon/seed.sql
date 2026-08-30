-- =====================================================================
-- 🐘 Neon PostgreSQL Seed Data for MailInfluence-ONA
-- =====================================================================

INSERT INTO employees (name, email, department, role, page_rank, betweenness) VALUES
('Sarah Connor', 'sarah@corp.com', 'Engineering', 'CTO', 0.1420, 24.5),
('Alex Mercer', 'alex@corp.com', 'Executive', 'CEO', 0.1250, 18.0),
('David Miller', 'david@corp.com', 'Engineering', 'Tech Lead', 0.0980, 12.3),
('Claire Bennet', 'claire@corp.com', 'HR', 'HR Director', 0.0890, 15.6),
('Mark Sloan', 'mark@corp.com', 'Sales', 'VP Sales', 0.0810, 8.4),
('Elena Rostova', 'elena@corp.com', 'Engineering', 'Senior Dev', 0.0750, 5.2),
('James Vance', 'james@corp.com', 'Product', 'Head of Product', 0.0720, 11.8),
('Sophia Lin', 'sophia@corp.com', 'Product', 'Product Owner', 0.0650, 6.9),
('Lucas Scott', 'lucas@corp.com', 'Sales', 'Sales Lead', 0.0590, 4.1),
('Emma Watson', 'emma@corp.com', 'Design', 'Lead UI/UX', 0.0540, 7.3),
('Michael Chang', 'michael@corp.com', 'Finance', 'CFO', 0.0510, 3.8),
('Rachel Green', 'rachel@corp.com', 'HR', 'Talent Lead', 0.0480, 4.5),
('Harvey Specter', 'harvey@corp.com', 'Legal', 'General Counsel', 0.0430, 2.9),
('Donna Paulsen', 'donna@corp.com', 'Executive', 'Chief of Staff', 0.0390, 9.1),
('Louis Litt', 'louis@corp.com', 'Legal', 'Senior Partner', 0.0370, 1.8);

INSERT INTO ona_departments (department_name, member_count, internal_flux, external_flux, isolation_score, is_silo) VALUES
('Engineering', 3, 245.5, 62.0, 79.8, TRUE),
('Sales', 2, 180.2, 54.0, 76.9, TRUE),
('Product', 2, 95.0, 120.5, 44.1, FALSE),
('Executive', 2, 85.0, 110.0, 43.6, FALSE),
('HR', 2, 72.0, 98.0, 42.4, FALSE),
('Legal', 2, 65.0, 28.0, 69.9, FALSE),
('Finance', 1, 35.0, 42.0, 45.5, FALSE),
('Design', 1, 30.0, 45.0, 40.0, FALSE);

INSERT INTO ona_audit_reports (health_score, grade, density, reciprocity, cross_dept_connectivity, resilience_score, executive_summary) VALUES
(71.4, 'B', 14.5, 68.2, 76.2, 58.0, 'Réseau collaboratif sain mais présentant un risque de silo modéré sur l''Engineering et le Sales, ainsi qu''un Bus Factor concentré sur 3 leaders clés.');

INSERT INTO ona_recommendations (report_id, recommendation_text) VALUES
(1, 'Désenclaver l''équipe Engineering en organisant des rituels transversaux hebdomadaires avec le département Product et Sales.'),
(2, 'Rééquilibrer la charge décisionnelle de Sarah Connor (CTO) et Claire Bennet (HR Director) pour mitiger le Bus Factor critique.'),
(3, 'Valoriser et formaliser le rôle de connecteur clé (Boundary Spanner) de James Vance (Head of Product).');
