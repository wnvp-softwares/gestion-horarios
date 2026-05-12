const { Grupo } = require('../../models');
const { Op } = require('sequelize');

const obtenerGrupos = async (req, res) => {
    try {
        const { search = '' } = req.query;
        
        // Permite buscar por el nombre (ej. "Grupo 1A") o el identificador (ej. "1A")
        const condicion = search ? {
            [Op.or]: [
                { nombre: { [Op.like]: `%${search}%` } },
                { identificador: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const grupos = await Grupo.findAll({
            where: condicion,
            order: [['id', 'DESC']]
        });
        
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearGrupo = async (req, res) => {
    try {
        const nuevoGrupo = await Grupo.create(req.body);
        res.status(201).json(nuevoGrupo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 👇 NUEVAS FUNCIONES PARA EDITAR Y BORRAR 👇
const actualizarGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        await Grupo.update(req.body, { where: { id } });
        res.json({ mensaje: 'Grupo actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarGrupo = async (req, res) => {
    try {
        const { id } = req.params;
        await Grupo.destroy({ where: { id } });
        res.json({ mensaje: 'Grupo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerGrupos, crearGrupo, actualizarGrupo, eliminarGrupo };