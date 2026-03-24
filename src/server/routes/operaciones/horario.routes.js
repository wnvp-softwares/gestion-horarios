const { Router } = require('express');
const { obtenerHorarioCompleto, generarHorarioAutomatico } = require('../../controllers/operaciones/horario.controller');

const router = Router();

router.get('/', obtenerHorarioCompleto);
router.post('/generar', generarHorarioAutomatico);

module.exports = router;