const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const HorarioGenerado = sequelize.define('HorarioGenerado', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periodo_id: { type: DataTypes.INTEGER, allowNull: false },
    docente_id: { type: DataTypes.INTEGER, allowNull: false },
    asignatura_id: { type: DataTypes.INTEGER, allowNull: false },
    grupo_id: { type: DataTypes.INTEGER, allowNull: false },
    aula_id: { type: DataTypes.INTEGER, allowNull: false },
    dia_semana: { type: DataTypes.STRING(15), allowNull: false },
    hora_inicio: { type: DataTypes.TIME, allowNull: false },
    hora_fin: { type: DataTypes.TIME, allowNull: false },
    es_conflicto: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'horarios_generados',
    timestamps: false
});

module.exports = HorarioGenerado;