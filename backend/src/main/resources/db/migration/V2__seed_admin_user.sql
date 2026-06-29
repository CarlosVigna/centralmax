INSERT INTO users (id, name, email, password_hash, role, active, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Administrador',
    'admin@centralmax.com.br',
    '$2a$10$Dah65yaIkLprORWQahsHcOQSkdMdWTIIULz5cr9Di6dlkUzaymZcW',
    'ADMIN',
    true,
    now(),
    now()
);
