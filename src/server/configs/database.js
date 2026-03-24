const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const sequelize = new Sequelize(
    process.env.DB_NAME,       
    process.env.DB_USER,       
    process.env.DB_PASSWORD,   
    {
        host: process.env.DB_HOST, 
        port: process.env.DB_PORT, 
        dialect: 'mysql',          
        logging: false,            
        pool: {
            max: 5,               
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

async function testearConexion() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos MySQL establecida con éxito.');
    } catch (error) {
        console.error('❌ Error: No se pudo conectar a la base de datos.', error.message);
    }
}

testearConexion();

module.exports = sequelize;