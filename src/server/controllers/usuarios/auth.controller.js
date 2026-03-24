const { Usuario } = require('../../models');

const iniciarSesion = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        const usuario = await Usuario.findOne({ where: { correo } });
        
        if (!usuario) {
            return res.status(404).json({ error: 'El correo ingresado no existe.' });
        }

        if (usuario.contrasena !== contrasena) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol,
                correo: usuario.correo
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { iniciarSesion };