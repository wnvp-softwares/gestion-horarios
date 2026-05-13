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

// 👇 EL MOTOR INTELIGENTE DE ASIGNACIÓN 👇
const crearHorarioManual = async (req, res) => {
    try {
        const { docente_id, aula_id, dia_semana, hora_inicio } = req.body;

        // Validación 1: ¿El profesor ya tiene clase a esta hora en otro grupo?
        const choqueDocente = await HorarioGenerado.findOne({
            where: { docente_id, dia_semana, hora_inicio },
            include: [{ model: Grupo, as: 'grupo' }]
        });
        if (choqueDocente) {
            return res.status(400).json({ error: `El docente ya está asignado al grupo ${choqueDocente.grupo.identificador} el ${dia_semana} a las ${hora_inicio.substring(0,5)}.` });
        }

        // Validación 2: ¿El aula ya está ocupada?
        const choqueAula = await HorarioGenerado.findOne({
            where: { aula_id, dia_semana, hora_inicio },
            include: [{ model: Grupo, as: 'grupo' }]
        });
        if (choqueAula) {
            return res.status(400).json({ error: `El aula seleccionada ya está siendo ocupada por el grupo ${choqueAula.grupo.identificador} a esa misma hora.` });
        }

        // Si pasa los filtros, se guarda.
        const nuevoHorario = await HorarioGenerado.create(req.body);
        res.status(201).json(nuevoHorario);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarHorario = async (req, res) => {
    try {
        await HorarioGenerado.destroy({ where: { id: req.params.id } });
        res.json({ mensaje: 'Clase eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerHorarioCompleto, crearHorarioManual, eliminarHorario };