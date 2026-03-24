const { Router } = require('express');
const { obtenerAulas, crearAula } = require('../../controllers/escuela/aula.controller');

const router = Router();

router.get('/', obtenerAulas);
router.post('/', crearAula);

module.exports = router;