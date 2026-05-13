const { Router } = require('express');
const { obtenerHorarioCompleto, crearHorarioManual, eliminarHorario } = require('../../controllers/operaciones/horario.controller');

const router = Router();

router.get('/', obtenerHorarioCompleto);
router.post('/', crearHorarioManual); 
router.delete('/:id', eliminarHorario);

module.exports = router;