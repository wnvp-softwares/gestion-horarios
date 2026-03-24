const { Router } = require('express');
const { obtenerPeriodos, crearPeriodo, activarPeriodo } = require('../../controllers/escuela/periodo.controller');

const router = Router();

router.get('/', obtenerPeriodos);
router.post('/', crearPeriodo);
router.put('/:id/activar', activarPeriodo);

module.exports = router;