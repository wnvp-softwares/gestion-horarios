const { Router } = require('express');
const { obtenerDisponibilidadPorDocente, guardarDisponibilidad } = require('../../controllers/operaciones/disponibilidad.controller');

const router = Router();

router.get('/:docente_id', obtenerDisponibilidadPorDocente);
router.post('/', guardarDisponibilidad);

module.exports = router;