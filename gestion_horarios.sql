-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_horarios;
USE gestion_horarios;

-- 2. Tabla de Usuarios (Para el Login)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Administrador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Periodos
CREATE TABLE periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- Ej. Semestre Ago - Dic 2026
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    es_activo BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Docentes
CREATE TABLE docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador VARCHAR(20) UNIQUE NOT NULL, -- Ej. DOC-01
    prefijo VARCHAR(20), -- Ej. Ing., Dra., Mtro.
    nombre_completo VARCHAR(150) NOT NULL,
    especialidad VARCHAR(100), -- Ej. Matemáticas / Física
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    es_activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Asignaturas
CREATE TABLE asignaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL, -- Ej. MAT-101
    nombre VARCHAR(100) NOT NULL,
    area VARCHAR(100), -- Ej. Ciencias Exactas, Ingeniería
    horas_semanales INT NOT NULL,
    color_hex VARCHAR(10) DEFAULT '#2563eb', -- Para pintar las tarjetas en el dashboard
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Grupos
CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identificador VARCHAR(10) UNIQUE NOT NULL, -- Ej. 1A, 3B
    nombre VARCHAR(50) NOT NULL, -- Ej. Grupo 1A
    grado VARCHAR(50) NOT NULL, -- Ej. 1er Semestre
    turno VARCHAR(50) NOT NULL, -- Matutino o Vespertino
    capacidad INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Aulas (Requerida por la vista de Generación de Horarios)
CREATE TABLE aulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL, -- Ej. Aula 104
    capacidad INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de Disponibilidad Docente (El grid de horas)
CREATE TABLE disponibilidad_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    dia_semana VARCHAR(15) NOT NULL, -- Lunes, Martes, etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_estado VARCHAR(20) NOT NULL, -- 'disponible' o 'preferencia'
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE CASCADE
);

-- 9. Tabla Principal de Horarios Generados (La joya de la corona)
CREATE TABLE horarios_generados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodo_id INT NOT NULL,
    docente_id INT NOT NULL,
    asignatura_id INT NOT NULL,
    grupo_id INT NOT NULL,
    aula_id INT NOT NULL,
    dia_semana VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    es_conflicto BOOLEAN DEFAULT FALSE, -- Para marcar en rojo si hay cruces
    FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

-- Usuarios (Contraseñas de ejemplo en texto plano, recuerda usar hash en producción)
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Admin General', 'admin@escuela.com', 'admin123', 'Administrador'),
('Coordinador Académico', 'coord@escuela.com', 'coord2026', 'Administrador'),
('Soporte Técnico', 'soporte@escuela.com', 'soporte789', 'Administrador'),
('Laura Méndez', 'laura.m@escuela.com', 'user_laura', 'Administrador'),
('Ricardo Sosa', 'ricardo.s@escuela.com', 'user_ricardo', 'Administrador');

-- Periodos
INSERT INTO periodos (nombre, fecha_inicio, fecha_fin, es_activo) VALUES
('Semestre Ene - Jun 2026', '2026-01-15', '2026-06-20', FALSE),
('Verano Intenso 2026', '2026-07-01', '2026-08-10', FALSE),
('Semestre Ago - Dic 2026', '2026-08-15', '2026-12-18', TRUE),
('Especial Invierno 2026', '2027-01-02', '2027-01-25', FALSE),
('Semestre Ene - Jun 2027', '2027-01-30', '2027-06-15', FALSE);

-- Docentes
INSERT INTO docentes (identificador, prefijo, nombre_completo, especialidad, correo, telefono) VALUES
('DOC-01', 'Dra.', 'Elena Rodríguez', 'Matemáticas', 'elena.rodriguez@email.com', '555-0101'),
('DOC-02', 'Ing.', 'Marcos Ruiz', 'Sistemas', 'marcos.ruiz@email.com', '555-0102'),
('DOC-03', 'Mtro.', 'Julián Castro', 'Física', 'julian.castro@email.com', '555-0103'),
('DOC-04', 'Dra.', 'Sofía Villalba', 'Programación', 'sofia.v@email.com', '555-0104'),
('DOC-05', 'Lic.', 'Héctor Gómez', 'Humanidades', 'hector.g@email.com', '555-0105');

-- Asignaturas
INSERT INTO asignaturas (codigo, nombre, area, horas_semanales, color_hex) VALUES
('MAT-101', 'Cálculo Diferencial', 'Ciencias Exactas', 5, '#ef4444'),
('PROG-202', 'Estructura de Datos', 'Ingeniería', 4, '#3b82f6'),
('FIS-301', 'Mecánica Clásica', 'Ciencias Exactas', 4, '#10b981'),
('BD-404', 'Bases de Datos I', 'Ingeniería', 5, '#f59e0b'),
('ETI-100', 'Ética Profesional', 'Humanidades', 2, '#8b5cf6');

-- Grupos
INSERT INTO grupos (identificador, nombre, grado, turno, capacidad) VALUES
('1A', 'Grupo 1A', '1er Semestre', 'Matutino', 30),
('3B', 'Grupo 3B', '3er Semestre', 'Vespertino', 25),
('5A', 'Grupo 5A', '5to Semestre', 'Matutino', 35),
('1C', 'Grupo 1C', '1er Semestre', 'Vespertino', 30),
('7A', 'Grupo 7A', '7mo Semestre', 'Matutino', 20);

-- Aulas
INSERT INTO aulas (nombre, capacidad) VALUES
('Aula 101', 35),
('Aula 102', 30),
('Laboratorio A', 25),
('Laboratorio B', 25),
('Auditorio 1', 100);

-- Disponibilidad Docente (Basado en IDs de docentes insertados arriba)
INSERT INTO disponibilidad_docentes (docente_id, dia_semana, hora_inicio, hora_fin, tipo_estado) VALUES
(1, 'Lunes', '07:00:00', '12:00:00', 'disponible'),
(1, 'Martes', '07:00:00', '10:00:00', 'preferencia'),
(2, 'Miércoles', '14:00:00', '18:00:00', 'disponible'),
(3, 'Lunes', '09:00:00', '13:00:00', 'disponible'),
(4, 'Jueves', '08:00:00', '11:00:00', 'preferencia');

-- Horarios Generados (Relacionando todas las tablas anteriores)
INSERT INTO horarios_generados (periodo_id, docente_id, asignatura_id, grupo_id, aula_id, dia_semana, hora_inicio, hora_fin) VALUES
(3, 1, 1, 1, 1, 'Lunes', '07:00:00', '09:00:00'),
(3, 2, 2, 3, 3, 'Miércoles', '14:00:00', '16:00:00'),
(3, 3, 3, 1, 2, 'Lunes', '09:00:00', '11:00:00'),
(3, 4, 4, 3, 4, 'Jueves', '08:00:00', '10:00:00'),
(3, 5, 5, 2, 2, 'Viernes', '15:00:00', '17:00:00');