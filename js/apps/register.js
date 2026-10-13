import { createExplorerApp } from "./explorer.js";
import { createNotepadApp } from "./notepad.js";
import { createTerminalApp } from "./terminal.js";
import { createAimApp } from "./aim.js";
import { createProjectApp } from "./projects.js";
import { createAboutApp, createControlPanelApp } from "./systemApps.js";
import { createDialUpApp } from "./dialup.js";
import { createInternetExplorerApp } from "./internetExplorer.js";

export function registerCoreApps(desktop) {
    [
        createExplorerApp(),
        createNotepadApp(),
        createTerminalApp(),
        createAimApp(),
        createProjectApp(),
        createAboutApp(),
        createControlPanelApp(),
        createDialUpApp(),
        createInternetExplorerApp(),
    ].forEach(app => desktop.registerApp(app));
}