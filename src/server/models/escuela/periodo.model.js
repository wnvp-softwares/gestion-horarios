const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const Periodo = sequelize.define('Periodo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_fin: { type: DataTypes.DATEONLY, allowNull: false },
    es_activo: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'periodos',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = Periodo;