import {Tray, BrowserWindow, Menu} from 'electron';
import { resolve } from "path";
import {initWindowsMenu} from "./menu";

export const initTray = (window: BrowserWindow) => {
    const image = resolve(__dirname, '../../src/assets/trayTemplate.png');
    const trayObj = new Tray(image);
    trayObj.setToolTip('Dolphin');

    if (process.platform !== 'darwin') {
        trayObj.setContextMenu(Menu.buildFromTemplate(initWindowsMenu(window)));
    }


    trayObj.on('click', e => {
        if (!window.isVisible()) {
            e.preventDefault();
            window.show();
        } else {
            window.setAlwaysOnTop(true);
            window.setAlwaysOnTop(false);
        }
    });

    trayObj.on('right-click', e => {
        trayObj.popUpContextMenu();
    });

    return trayObj;
};
