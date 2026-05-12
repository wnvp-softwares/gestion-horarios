const { Router } = require('express');
const {
    obtenerDocentes, crearDocente, actualizarDocente, eliminarDocente } = require('../../controllers/usuarios/docente.controller');

const router = Router();

router.get('/', obtenerDocentes);
router.post('/', crearDocente);
router.put('/:id', actualizarDocente);
router.delete('/:id', eliminarDocente);

module.exports = router;