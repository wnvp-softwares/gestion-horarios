const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const Docente = sequelize.define('Docente', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    identificador: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    prefijo: {
        type: DataTypes.STRING(20)
    },
    nombre_completo: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    especialidad: {
        type: DataTypes.STRING(100)
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: false, unique: true
    },
    telefono: {
        type: DataTypes.STRING(15)
    },
    es_activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'docentes',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = Docente;