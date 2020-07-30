import { app, BrowserWindow } from 'electron';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ProxyService } from "./services";
import { INestApplicationContext } from "@nestjs/common";
import { initAppMenu } from "./menu";
import * as packages from '../package.json';
import { NestRPC } from "electron-nest-rpc";
import { NestLogger } from "@nestcloud/logger";
import { resolve } from 'path';
import { initTray } from "./tray";

// require('update-electron-app')()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

let willQuit = false;
// @ts-ignore
let tray;
let mainWindow;
let context: INestApplicationContext;

const createApp = async () => {
    context = await NestFactory.createApplicationContext(AppModule, {
        logger: new NestLogger({
            filePath: '',
            level: 'info',
            transports: [{
                transport: 'console',
                level: 'debug',
                colorize: true,
                datePattern: 'YYYY-MM-DD hh:mm:ss',
                label: 'dolphin',
            }, {
                filename: resolve(app.getPath('home'), 'dolphin/dolphin.log'),
                transport: 'file',
                level: 'info',
                colorize: false,
                datePattern: 'YYYY-MM-DD hh:mm:ss',
                label: 'dolphin',
                json: false,
                maxFiles: 0,
                maxSize: 10240,
            }]
        })
    });
    NestRPC.register(context);
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
        resizable: false,
        fullscreen: false,
        title: packages.productName,
        backgroundColor: '#272b2e',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    initAppMenu(mainWindow);
    tray = initTray(mainWindow);

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
// app.dock.hide();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
