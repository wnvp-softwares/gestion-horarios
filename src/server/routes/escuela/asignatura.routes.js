const { Router } = require('express');
const { 
    obtenerAsignaturas, 
    crearAsignatura, 
    actualizarAsignatura, 
    eliminarAsignatura 
} = require('../../controllers/escuela/asignatura.controller');

const router = Router();

router.get('/', obtenerAsignaturas);
router.post('/', crearAsignatura);
router.put('/:id', actualizarAsignatura); // <-- Ruta para editar conectada
router.delete('/:id', eliminarAsignatura); // <-- Ruta para borrar conectada

module.exports = router;