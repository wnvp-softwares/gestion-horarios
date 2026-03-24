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