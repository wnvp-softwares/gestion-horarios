const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const Asignatura = sequelize.define('Asignatura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    area: {
        type: DataTypes.STRING(100)
    },
    horas_semanales: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    color_hex: {
        type: DataTypes.STRING(10),
        defaultValue: '#2563eb'
    }
}, {
    tableName: 'asignaturas',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = Asignatura;