import { createDesktop } from "./system/desktop.js";
import { registerCoreApps } from "./apps/register.js";

const desktop = createDesktop({
    desktopElement: document.querySelector("#desktop"),
    iconContainer: document.querySelector("#desktop-icons"),
    windowLayer: document.querySelector("#window-layer"),
    taskbarContainer: document.querySelector("#taskbar-windows"),
    startMenu: document.querySelector("#start-menu"),
});

registerCoreApps(desktop);
desktop.mount();
desktop.openApp("explorer", { path: "C:\\Projects" });
desktop.openApp("notepad", { filePath: "C:\\Documents\\About Me.txt" });