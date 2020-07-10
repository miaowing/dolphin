import { shell, BrowserWindow, app, MenuItemConstructorOptions, Menu } from 'electron';
import * as packages from '../package.json';

export const initAppMenu = (window: BrowserWindow) => {
    if (process.platform === 'darwin') {
        Menu.setApplicationMenu(Menu.buildFromTemplate(initMacMenu(window)));
    }
};

export const initMacMenu = (window: BrowserWindow): MenuItemConstructorOptions[] => {
    return [
        {
            label: packages.productName,
            submenu: [
                {
                    label: '关于',
                    role: 'about',
                },
                {
                    type: 'separator'
                },
                {
                    label: `隐藏${packages.productName}`,
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: '隐藏其他',
                    accelerator: 'Command+Alt+H',
                    role: 'hideOthers',
                },
                {
                    label: '显示所有',
                    role: 'unhide:'
                },
                {
                    type: 'separator'
                },
                {
                    label: '退出',
                    accelerator: 'Cmd+Q',
                    click: () => app.exit(0)
                }
            ]
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '刷新',
                    accelerator: 'Command+R',
                    role: 'reload'
                },
                {
                    label: 'DevTools',
                    accelerator: 'Alt+Command+I',
                    role: 'toggledevtools',
                }
            ]
        },
        {
            label: '窗口',
            submenu: [
                {
                    label: '最小化',
                    accelerator: 'Command+M',
                    role: 'minimize:'
                },
                {
                    label: '关闭',
                    accelerator: 'Command+W',
                    role: 'close'
                },
                {
                    type: 'separator'
                },
                {
                    label: '前置全部窗口',
                    role: 'front'
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: 'GitHub',
                    click: () => {
                        shell.openExternal('https://github.com/miaowing/dolphin');
                    }
                },
                {
                    type: 'separator'
                }, {
                    label: 'Report Issues',
                    click: () => {
                        shell.openExternal('https://github.com/miaowing/dolphin/issues');
                    }
                }
            ]
        }
    ];
};
