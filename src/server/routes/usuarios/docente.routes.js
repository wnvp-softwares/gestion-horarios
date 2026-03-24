const { Router } = require('express');
const { obtenerDocentes, crearDocente, actualizarDocente } = require('../../controllers/usuarios/docente.controller');

const router = Router();

router.get('/', obtenerDocentes);
router.post('/', crearDocente);
router.put('/:id', actualizarDocente); 

module.exports = router;