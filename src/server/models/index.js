const sequelize = require('../configs/database');

// 1. Importar todos los modelos desde sus nuevas carpetas
// ---------------------------------------------------------
// Carpeta: usuarios
const Usuario = require('./usuarios/usuario.model');
const Docente = require('./usuarios/docente.model');

// Carpeta: escuela
const Periodo = require('./escuela/periodo.model');
const Asignatura = require('./escuela/asignatura.model');
const Grupo = require('./escuela/grupo.model');
const Aula = require('./escuela/aula.model');

// Carpeta: operaciones
const DisponibilidadDocente = require('./operaciones/disponibilidad_docente.model');
const HorarioGenerado = require('./operaciones/horario_generado.model');

// ==========================================
// 2. DEFINIR LAS RELACIONES (ASOCIACIONES)
// ==========================================

// Relación: Un Docente tiene muchas Disponibilidades
Docente.hasMany(DisponibilidadDocente, { foreignKey: 'docente_id', as: 'disponibilidades' });
DisponibilidadDocente.belongsTo(Docente, { foreignKey: 'docente_id', as: 'docente' });

// Relaciones del Horario Generado (La tabla central cruza con todo)
HorarioGenerado.belongsTo(Periodo, { foreignKey: 'periodo_id', as: 'periodo' });
HorarioGenerado.belongsTo(Docente, { foreignKey: 'docente_id', as: 'docente' });
HorarioGenerado.belongsTo(Asignatura, { foreignKey: 'asignatura_id', as: 'asignatura' });
HorarioGenerado.belongsTo(Grupo, { foreignKey: 'grupo_id', as: 'grupo' });
HorarioGenerado.belongsTo(Aula, { foreignKey: 'aula_id', as: 'aula' });

// ==========================================
// 3. EXPORTAR TODO EMPAQUETADO
// ==========================================
module.exports = {
    sequelize,
    Usuario,
    Docente,
    Periodo,
    Asignatura,
    Grupo,
    Aula,
    DisponibilidadDocente,
    HorarioGenerado
};