const { Asignatura } = require('../../models');
const { Op } = require('sequelize');

const obtenerAsignaturas = async (req, res) => {
    try {
        const { search = '' } = req.query;
        
        const condicion = search ? {
            [Op.or]: [
                { nombre: { [Op.like]: `%${search}%` } },
                { codigo: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const asignaturas = await Asignatura.findAll({
            where: condicion,
            order: [['id', 'DESC']]
        });
        
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

const actualizarAsignatura = async (req, res) => {
    try {
        const { id } = req.params;
        await Asignatura.update(req.body, { where: { id } });
        res.json({ mensaje: 'Asignatura actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarAsignatura = async (req, res) => {
    try {
        const { id } = req.params;
        await Asignatura.destroy({ where: { id } });
        res.json({ mensaje: 'Asignatura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerAsignaturas, crearAsignatura, actualizarAsignatura, eliminarAsignatura };