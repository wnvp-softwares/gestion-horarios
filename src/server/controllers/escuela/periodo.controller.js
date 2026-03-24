const { Periodo } = require('../../models');

const obtenerPeriodos = async (req, res) => {
    try {
        const periodos = await Periodo.findAll();
        res.json(periodos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearPeriodo = async (req, res) => {
    try {
        const nuevoPeriodo = await Periodo.create(req.body);
        res.status(201).json(nuevoPeriodo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const activarPeriodo = async (req, res) => {
    try {
        const { id } = req.params;
        await Periodo.update({ es_activo: false }, { where: {} });
        await Periodo.update({ es_activo: true }, { where: { id } });
        res.json({ mensaje: 'Periodo activado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerPeriodos, crearPeriodo, activarPeriodo };