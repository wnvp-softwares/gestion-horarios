const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const DisponibilidadDocente = sequelize.define('DisponibilidadDocente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    docente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dia_semana: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    tipo_estado: {
        type: DataTypes.STRING(20),
        allowNull: false
    }
},
    {
        tableName: 'disponibilidad_docentes',
        timestamps: false
    });

module.exports = DisponibilidadDocente;