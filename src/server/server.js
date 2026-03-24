const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const { sequelize } = require('./models');

const rutasPrincipales = require('./routes');

const app = express();

// ==========================================
// 1. MIDDLEWARES (Configuraciones base)
// ==========================================
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. RUTAS PRINCIPALES
// ==========================================
app.use('/api', rutasPrincipales);

// ==========================================
// 3. INICIALIZACIÓN DEL SERVIDOR Y BASE DE DATOS
// ==========================================
const PUERTO = process.env.PORT || 3000;

const iniciarServidor = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida en server.js');

        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados exitosamente');

        app.listen(PUERTO, () => {
            console.log(`🚀 Servidor backend corriendo en http://localhost:${PUERTO}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
    }
};

iniciarServidor();

module.exports = app;