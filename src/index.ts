import { app, BrowserWindow } from 'electron';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ProxyService } from "./services";
import { INestApplicationContext } from "@nestjs/common";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

let willQuit = false;
let mainWindow;
let context: INestApplicationContext;

const createApp = async () => {
    context = await NestFactory.createApplicationContext(AppModule, {});
}

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 600,
        width: 400,
        maxHeight: 600,
        maxWidth: 400,
        minHeight: 600,
        minWidth: 400,
        center: true,
        show: false,
        fullscreenable: false,
        backgroundColor: '#272b2e',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            webSecurity: false,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    });

    let disconnected = false;
    mainWindow.on('close', e => {
        if (willQuit) {
            const proxyService = context.get<ProxyService>(ProxyService);
            if (!disconnected) {
                e.preventDefault();
                proxyService.disableMacOSSocksProxy().then(() => {
                    disconnected = true;
                    app.quit();
                });
            }
            mainWindow = null;
        } else {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    createWindow();
    await createApp();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    mainWindow.show();
});

process.on('uncaughtException', e => {
    console.log(e);
});

app.on('before-quit', () => willQuit = true);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
