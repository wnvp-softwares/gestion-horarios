const { Docente } = require('../../models');

const obtenerDocentes = async (req, res) => {
    try {
        const docentes = await Docente.findAll();
        res.json(docentes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearDocente = async (req, res) => {
    try {
        const nuevoDocente = await Docente.create(req.body);
        res.status(201).json(nuevoDocente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        await Docente.update(req.body, { where: { id } });
        res.json({ mensaje: 'Docente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerDocentes, crearDocente, actualizarDocente };