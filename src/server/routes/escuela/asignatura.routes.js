const { Router } = require('express');
const { obtenerAsignaturas, crearAsignatura } = require('../../controllers/escuela/asignatura.controller');

const router = Router();

router.get('/', obtenerAsignaturas);
router.post('/', crearAsignatura);

module.exports = router;