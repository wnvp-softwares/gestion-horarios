const { HorarioGenerado, Docente, Asignatura, Grupo, Aula } = require('../../models');

const obtenerHorarioCompleto = async (req, res) => {
    try {
        const horarios = await HorarioGenerado.findAll({
            include: [
                { model: Docente, as: 'docente' },
                { model: Asignatura, as: 'asignatura' },
                { model: Grupo, as: 'grupo' },
                { model: Aula, as: 'aula' }
            ]
        });
        res.json(horarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generarHorarioAutomatico = async (req, res) => {
    try {
        res.json({ mensaje: 'Generación iniciada...' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerHorarioCompleto, generarHorarioAutomatico };