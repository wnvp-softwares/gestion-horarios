const { Docente } = require('../../models');

const obtenerDocentes = async (req, res) => {
    try {
        const { page = 1, limit = 6, search = '' } = req.query;
        
        const condicion = search ? {
            nombre_completo: { [require('sequelize').Op.like]: `%${search}%` }
        } : {};

        const offset = (page - 1) * limit;

        const { count, rows } = await Docente.findAndCountAll({
            where: condicion,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']]
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

const eliminarDocente = async (req, res) => {
    try {
        const { id } = req.params;
        await Docente.destroy({ where: { id } });
        res.json({ mensaje: 'Docente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerDocentes, crearDocente, actualizarDocente, eliminarDocente };