const { DisponibilidadDocente, Docente } = require('../../models');

const obtenerDisponibilidadPorDocente = async (req, res) => {
    try {
        const { docente_id } = req.params;
        const disponibilidad = await DisponibilidadDocente.findAll({
            where: { docente_id },
            include: [{ model: Docente, as: 'docente' }]
        });
        res.json(disponibilidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const guardarDisponibilidad = async (req, res) => {
    try {
        const { docente_id, horarios } = req.body;
        await DisponibilidadDocente.destroy({ where: { docente_id } });
        const nuevaDisponibilidad = await DisponibilidadDocente.bulkCreate(horarios);
        res.status(201).json(nuevaDisponibilidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerDisponibilidadPorDocente, guardarDisponibilidad };