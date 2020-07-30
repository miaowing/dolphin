import { Tray, BrowserWindow } from 'electron';
import { resolve } from "path";

export const initTray = (window: BrowserWindow) => {
    const image = resolve(__dirname, '../../src/assets/trayTemplate.png');
    const trayObj = new Tray(image);
    trayObj.setToolTip('Dolphin');


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
