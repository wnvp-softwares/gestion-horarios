const { Router } = require('express');
const { 
    obtenerPeriodos, 
    crearPeriodo, 
    activarPeriodo, 
    actualizarPeriodo 
} = require('../../controllers/escuela/periodo.controller');

const router = Router();

router.get('/', obtenerPeriodos);
router.post('/', crearPeriodo);
router.put('/:id', actualizarPeriodo); 
router.put('/:id/activar', activarPeriodo); 

module.exports = router;