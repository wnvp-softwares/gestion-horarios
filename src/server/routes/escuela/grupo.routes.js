const { Router } = require('express');
const { 
    obtenerGrupos, 
    crearGrupo, 
    actualizarGrupo, 
    eliminarGrupo 
} = require('../../controllers/escuela/grupo.controller');

const router = Router();

router.get('/', obtenerGrupos);
router.post('/', crearGrupo);
router.put('/:id', actualizarGrupo); // <-- Conectado
router.delete('/:id', eliminarGrupo); // <-- Conectado

module.exports = router;