-- Script de inicialización de la base de datos
-- Sistema de Gestión de Empleados y Solicitudes

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    "isActive" BOOLEAN DEFAULT false,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS user_roles (
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "roleId" INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY ("userId", "roleId")
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    salary DECIMAL(10, 2),
    email VARCHAR(100) UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(255) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'cancelada', 'completada')),
    "employeeId" INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


INSERT INTO roles (name, description) 
VALUES 
    ('empleado', 'Rol de empleado'),
    ('administrador', 'Rol de administrador')
ON CONFLICT (name) DO NOTHING;


INSERT INTO users ("firstName", "lastName", email, password, "isActive", "createdAt", "updatedAt")
VALUES 
    ('Empleado 2', 'Demo', 'empleado@example.com', '$2b$10$XBRlU.ZQSI/GBn/McxmAsu2wz/vCYNuKBXRKLAkjclpyQWWWOrrIS', true, NOW(), NOW()),
    ('Administrador', 'Demo', 'administrador@example.com', '$2b$10$XBRlU.ZQSI/GBn/McxmAsu2wz/vCYNuKBXRKLAkjclpyQWWWOrrIS', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;


INSERT INTO user_roles ("userId", "roleId")
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'empleado@example.com' AND r.name = 'empleado'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles ("userId", "roleId")
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'administrador@example.com' AND r.name = 'administrador'
ON CONFLICT DO NOTHING;


INSERT INTO employees ("firstName", "lastName", "position", "salary", "email", "createdAt", "updatedAt") 
VALUES 
    ('Argenis', 'Gonzalez', 'Desarrollador', 3500.00, 'argenis@example.com', NOW(), NOW()),
    ('Jose', 'Gonzalez', 'Desarrollador', 4500.00, 'jose@example.com', NOW(), NOW()),
    ('Pablo', 'Gonzalez', 'Programador', 2500.00, 'pablo@example.com', NOW(), NOW()),
    ('Maria', 'Rodriguez', 'Diseñadora UX/UI', 3800.00, 'maria@example.com', NOW(), NOW()),
    ('Carlos', 'Martinez', 'Analista de Datos', 4200.00, 'carlos@example.com', NOW(), NOW()),
    ('Ana', 'Lopez', 'Project Manager', 5500.00, 'ana@example.com', NOW(), NOW()),
    ('Luis', 'Fernandez', 'QA Tester', 3200.00, 'luis@example.com', NOW(), NOW()),
    ('Sofia', 'Ramirez', 'DevOps Engineer', 5000.00, 'sofia@example.com', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO solicitudes (title, description, status, "employeeId", "createdAt", "updatedAt") 
VALUES 
    ('Solicitud de vacaciones', 'Solicito 5 días de vacaciones del 20 al 24 de noviembre', 'pendiente', 1, NOW(), NOW()),
    ('Cambio de equipo', 'Necesito una laptop nueva, la actual es muy lenta', 'completada', 2, NOW(), NOW()),
    ('Aumento salarial', 'Solicito revisión de salario por desempeño', 'pendiente', 3, NOW(), NOW()),
    ('Permiso médico', 'Cita médica el próximo viernes por la mañana', 'completada', 1, NOW(), NOW());