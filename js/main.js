import { createDesktop } from "./system/desktop.js";
import { registerCoreApps } from "./apps/register.js";
import { filesystemReady } from "./system/filesystem.js";

await filesystemReady;

const desktopElement = document.querySelector("#desktop");

function resizeDesktop() {
    const scale = Math.min(
        window.innerWidth / 1024,
        window.innerHeight / 768
    );

    desktopElement.style.setProperty("--desktop-scale", scale);
}

resizeDesktop();
window.addEventListener("resize", resizeDesktop);

const desktop = createDesktop({
    desktopElement: document.querySelector("#desktop"),
    iconContainer: document.querySelector("#desktop-icons"),
    windowLayer: document.querySelector("#window-layer"),
    taskbarContainer: document.querySelector("#taskbar-windows"),
    startMenu: document.querySelector("#start-menu"),
});

registerCoreApps(desktop);
desktop.mount();
desktop.openApp("projects");
desktop.openApp("notepad", { filePath: "C:\\Documents\\About Me.txt" });