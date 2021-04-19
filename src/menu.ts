import { shell, BrowserWindow, app, MenuItemConstructorOptions, Menu } from 'electron';
import * as packages from '../package.json';

export const initAppMenu = (window: BrowserWindow) => {
    if (process.platform === 'darwin') {
        Menu.setApplicationMenu(Menu.buildFromTemplate(initMacMenu(window)));
    }
    window.setMenuBarVisibility(false);
};

export const initWindowsMenu = (window: BrowserWindow): MenuItemConstructorOptions[] => {
    return [
        {
            label: 'DevTools',
            accelerator: 'Alt+Command+I',
            click: () => {
                window.webContents.openDevTools();
            }
        },
        {
            label: '反馈',
            click: () => {
                shell.openExternal('https://github.com/miaowing/dolphin/issues');
            }
        },
        {
            type: 'separator'
        },
        {
            label: '关于',
            role: 'about',
        },
        {
            label: '关闭',
            accelerator: 'Command+W',
            click: () => app.exit(0)
        }
    ]
}

export const initMacMenu = (window?: BrowserWindow): MenuItemConstructorOptions[] => {
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
                    role: 'unhide'
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
            label: '编辑',
            submenu: [
                {
                    label: '撤销',
                    accelerator: 'Command+Z',
                    role: 'undo'
                },
                {
                    label: '重做',
                    accelerator: 'Shift+Command+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: '剪切',
                    accelerator: 'Command+X',
                    role: 'cut'
                },
                {
                    label: '复制',
                    accelerator: 'Command+C',
                    role: 'copy'
                },
                {
                    label: '粘贴',
                    accelerator: 'Command+V',
                    role: 'paste'
                },
                {
                    label: '全选',
                    accelerator: 'Command+A',
                    role: 'selectAll'
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
                    role: 'toggleDevTools',
                }
            ]
        },
        {
            label: '窗口',
            submenu: [
                {
                    label: '最小化',
                    accelerator: 'Command+M',
                    role: 'minimize'
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
