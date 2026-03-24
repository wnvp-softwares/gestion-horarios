const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('../server.js');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 840,
        minWidth: 800,
        minHeight: 600,
        title: 'Sistema de Horarios Docentes',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    const vistaLogin = path.join(__dirname, '..', '..', 'main', 'interfaces', 'index.html'); mainWindow.loadFile(vistaLogin);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
