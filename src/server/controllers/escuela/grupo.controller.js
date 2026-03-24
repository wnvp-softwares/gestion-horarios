const { Grupo } = require('../../models');

const obtenerGrupos = async (req, res) => {
    try {
        const grupos = await Grupo.findAll();
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearGrupo = async (req, res) => {
    try {
        const nuevoGrupo = await Grupo.create(req.body);
        res.status(201).json(nuevoGrupo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerGrupos, crearGrupo };