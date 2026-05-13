const { Router } = require('express');
const { obtenerAulas } = require('../../controllers/escuela/aula.controller');
const router = Router();
router.get('/', obtenerAulas);
module.exports = router;