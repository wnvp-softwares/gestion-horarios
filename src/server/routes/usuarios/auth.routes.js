const { Router } = require('express');
const { iniciarSesion } = require('../../controllers/usuarios/auth.controller');

const router = Router();

router.post('/login', iniciarSesion);

module.exports = router;