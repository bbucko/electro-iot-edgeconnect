import {app, BrowserWindow, Menu} from 'electron';
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';

const settings = require('electron-settings');

let mainWindow: BrowserWindow | null = null;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
    enableLiveReload({strategy: 'react-hmr'});
}

const createWindow = async () => {
    let {width, height} = settings.has('windowBounds') ? settings.get('windowBounds') : {width: 640, height: 480};

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    if (isDevMode) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.on('resize', () => {
        let {width, height} = mainWindow.getBounds();
        settings.set('windowBounds', {width, height});
    });

    let template = [{
        label: 'Application',
        submenu: [
            {label: 'About Application', selector: 'orderFrontStandardAboutPanel:'},
            {type: 'separator'},
            {
                label: 'Quit', accelerator: 'Command+Q', click: function() {
                    app.quit();
                }
            }
        ]
    }, {
        label: 'Edit',
        submenu: [
            {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
            {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
            {type: 'separator'},
            {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
            {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
            {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
            {label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'}
        ]
    }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});