const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING(50),
        defaultValue: 'Administrador'
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = Usuario;