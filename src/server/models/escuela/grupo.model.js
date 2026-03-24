const { DataTypes } = require('sequelize');
const sequelize = require('../../configs/database');

const Grupo = sequelize.define('Grupo', {
    id: { type: DataTypes.INTEGER,
         primaryKey: true, 
         autoIncrement: true
         },
    identificador: { 
        type: DataTypes.STRING(10), 
        allowNull: false, 
        unique: true 
    },
    nombre: { 
        type: DataTypes.STRING(50), 
        allowNull: false 
    },
    grado: {
         type: DataTypes.STRING(50), 
         allowNull: false
         },
    turno: {
         type: DataTypes.STRING(50), 
         allowNull: false 
        },
    capacidad: {
         type: DataTypes.INTEGER, 
         allowNull: false 
        }
}, {
    tableName: 'grupos',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

module.exports = Grupo;