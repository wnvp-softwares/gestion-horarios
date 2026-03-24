const { Aula } = require('../../models');

const obtenerAulas = async (req, res) => {
    try {
        const aulas = await Aula.findAll();
        res.json(aulas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearAula = async (req, res) => {
    try {
        const nuevaAula = await Aula.create(req.body);
        res.status(201).json(nuevaAula);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerAulas, crearAula };