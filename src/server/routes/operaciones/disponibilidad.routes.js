const { Router } = require('express');
const { obtenerDisponibilidad, guardarDisponibilidad } = require('../../controllers/operaciones/disponibilidad.controller');

const router = Router();

router.get('/:docenteId', obtenerDisponibilidad);
router.post('/', guardarDisponibilidad);

module.exports = router;