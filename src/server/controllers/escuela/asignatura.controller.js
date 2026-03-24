const { Asignatura } = require('../../models');

const obtenerAsignaturas = async (req, res) => {
    try {
        const asignaturas = await Asignatura.findAll();
        res.json(asignaturas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearAsignatura = async (req, res) => {
    try {
        const nuevaAsignatura = await Asignatura.create(req.body);
        res.status(201).json(nuevaAsignatura);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerAsignaturas, crearAsignatura };