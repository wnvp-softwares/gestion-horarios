const { Router } = require('express');
const { obtenerGrupos, crearGrupo } = require('../../controllers/escuela/grupo.controller');

const router = Router();

router.get('/', obtenerGrupos);
router.post('/', crearGrupo);

module.exports = router;