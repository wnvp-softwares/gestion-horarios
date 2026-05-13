const { sequelize } = require('../../models');

const obtenerDisponibilidad = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const [resultados] = await sequelize.query(
            'SELECT * FROM disponibilidad_docentes WHERE docente_id = ?',
            { replacements: [docenteId] }
        );
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const guardarDisponibilidad = async (req, res) => {
    try {
        const { docente_id, horarios } = req.body;

        // 1. Borramos la disponibilidad anterior de este maestro para no duplicar datos
        await sequelize.query(
            'DELETE FROM disponibilidad_docentes WHERE docente_id = ?',
            { replacements: [docente_id] }
        );

        // 2. Insertamos las nuevas celdas marcadas una por una
        if (horarios && horarios.length > 0) {
            for (const h of horarios) {
                await sequelize.query(
                    'INSERT INTO disponibilidad_docentes (docente_id, dia_semana, hora_inicio, hora_fin, tipo_estado) VALUES (?, ?, ?, ?, ?)',
                    { replacements: [h.docente_id, h.dia_semana, h.hora_inicio, h.hora_fin, h.tipo_estado] }
                );
            }
        }

        res.json({ mensaje: 'Disponibilidad guardada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerDisponibilidad, guardarDisponibilidad };