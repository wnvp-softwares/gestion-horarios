const { Router } = require('express');
const { obtenerUsuarios, crearUsuario } = require('../../controllers/usuarios/usuario.controller');

const router = Router();

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);

module.exports = router;