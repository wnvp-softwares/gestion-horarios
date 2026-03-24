const { Router } = require('express');
const router = Router();

// Importamos las rutas de Usuarios
const usuarioRoutes = require('./usuarios/usuario.routes');
const docenteRoutes = require('./usuarios/docente.routes');
const authRoutes = require('./usuarios/auth.routes');

// Importamos las rutas de Escuela
const asignaturaRoutes = require('./escuela/asignatura.routes');
const aulaRoutes = require('./escuela/aula.routes');
const grupoRoutes = require('./escuela/grupo.routes');
const periodoRoutes = require('./escuela/periodo.routes');

// Importamos las rutas de Operaciones
const disponibilidadRoutes = require('./operaciones/disponibilidad.routes');
const horarioRoutes = require('./operaciones/horario.routes');

// ==========================================
// CONFIGURACIÓN DE LOS ENDPOINTS (URLs)
// ==========================================

// Rutas de Usuarios
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes); 
router.use('/docentes', docenteRoutes); 

// Rutas de Escuela
router.use('/asignaturas', asignaturaRoutes);
router.use('/aulas', aulaRoutes);
router.use('/grupos', grupoRoutes);
router.use('/periodos', periodoRoutes);

// Rutas de Operaciones
router.use('/disponibilidad', disponibilidadRoutes);
router.use('/horarios', horarioRoutes);

module.exports = router;