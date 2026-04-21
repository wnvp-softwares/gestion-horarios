const { Docente } = require('../../models');
const { Op } = require('sequelize');

const obtenerDocentes = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 6 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Docente.findAndCountAll({
            where: {
                [Op.or]: [
                    { nombre_completo: { [Op.like]: `%${search}%` } },
                    { identificador: { [Op.like]: `%${search}%` } },
                    { especialidad: { [Op.like]: `%${search}%` } }
                ]
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['creado_en', 'DESC']]
        });

        res.json({
            total: count,
            paginas: Math.ceil(count / limit),
            paginaActual: parseInt(page),
            docentes: rows
        });
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