const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const Aula = sequelize.define('Aula', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    capacidad: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'aulas',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = Aula;