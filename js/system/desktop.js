import { createWindowManager } from "./windowManager.js";

const shortcuts = [
    { appId: "explorer", label: "My Computer", icon: "assets/icons/my-computer.svg", options: { path: "C:\\" } },
    { appId: "aim", label: "AOL Instant Messenger", icon: "assets/icons/aim.svg" },
    { appId: "notepad", label: "Notepad", icon: "assets/icons/notepad.svg", options: { filePath: "C:\\Documents\\About Me.txt" } },
    { appId: "terminal", label: "MS-DOS Prompt", icon: "assets/icons/ms-dos.svg" },
    { appId: "projects", label: "My Projects", icon: "assets/icons/folder.svg" },
    { appId: "dialup", label: "Dial-Up Networking", icon: "assets/icons/dialup.svg" },
    { appId: "internet-explorer", label: "Internet Explorer", icon: "assets/icons/internet-explorer.svg" },
];

export function createDesktop({ desktopElement, iconContainer, windowLayer, taskbarContainer, startMenu }) {
    const windowManager = createWindowManager({ layer: windowLayer, taskbar: taskbarContainer });
    const apps = new Map();
    let selectedIcon = null;
    let clickTimer = null;
    const desktopApi = {
        registerApp(definition) { apps.set(definition.id, definition); },
        openApp(appId, options = {}) {
            const app = apps.get(appId);
            if (!app) return;
            return app.open({ desktop: desktopApi, windowManager, options });
        },
        createWindow(options) { return windowManager.createWindow(options); },
        getApps() { return [...apps.values()]; },
        mount() {
            renderShortcuts();
            renderStartMenu();
            startMenu.hidden = true;
            document.querySelector("#start-button").addEventListener("click", event => {
                event.stopPropagation();
                const button = event.currentTarget;
                startMenu.hidden = !startMenu.hidden;
                button.setAttribute("aria-expanded", String(!startMenu.hidden));
            });
            document.addEventListener("pointerdown", event => {
                if (!event.target.closest("#start-menu") && !event.target.closest("#start-button")) {
                    startMenu.hidden = true;
                    document.querySelector("#start-button").setAttribute("aria-expanded", "false");
                }
                const context = document.querySelector("#desktop-context-menu");
                if (!event.target.closest("#desktop-context-menu")) context.hidden = true;
            });
            desktopElement.addEventListener("contextmenu", event => {
                if (event.target.closest(".window, .taskbar, .desktop-icon")) return;
                event.preventDefault();
                const menu = document.querySelector("#desktop-context-menu");
                menu.hidden = false;
                menu.style.left = `${Math.min(event.clientX, innerWidth - 190)}px`;
                menu.style.top = `${Math.min(event.clientY, innerHeight - 90)}px`;
            });
            document.querySelector("#desktop-context-menu").addEventListener("click", event => {
                const action = event.target.closest("button")?.dataset.action;
                if (action === "open-about") desktopApi.openApp("about");
                if (action === "settings") desktopApi.openApp("control-panel");
                document.querySelector("#desktop-context-menu").hidden = true;
            });
            const clock = document.querySelector("#tray-clock");
            const updateClock = () => clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            updateClock();
            setInterval(updateClock, 30_000);
            document.querySelector("#sound-toggle").addEventListener("click", event => {
                const enabled = event.currentTarget.dataset.enabled !== "true";
                event.currentTarget.dataset.enabled = String(enabled);
                event.currentTarget.textContent = enabled ? "♫" : "♪";
                event.currentTarget.title = enabled ? "Sounds enabled" : "Sounds muted";
                desktopApi.soundEnabled = enabled;
            });
            desktopApi.soundEnabled = false;
        }
    };


    function createIcon(icon, className = "") {
        if (typeof icon === "string" &&
            /\.(?:svg|png|jpe?g|gif|webp|ico)(?:[?#].*)?$/i.test(icon)) {
            const image = document.createElement("img");
            image.className = className;
            image.src = icon;
            image.alt = "";
            image.draggable = false;
            return image;
        }

        const span = document.createElement("span");
        span.className = className;
        span.textContent = icon || "▣";
        return span;
    }

    function renderShortcuts() {
        iconContainer.replaceChildren();
        shortcuts.forEach(shortcut => {
            const button = document.createElement("button");
            button.className = "desktop-icon";
            button.type = "button";
            const iconArt = createIcon(shortcut.icon, "icon-art");
            iconArt.setAttribute("aria-hidden", "true");

            const label = document.createElement("span");
            label.className = "icon-label";
            label.textContent = shortcut.label;

            button.append(iconArt, label);
            button.addEventListener("click", event => {
                if (selectedIcon) selectedIcon.classList.remove("selected");
                selectedIcon = button;
                button.classList.add("selected");
                if (event.detail === 2) {
                    clearTimeout(clickTimer);
                    desktopApi.openApp(shortcut.appId, shortcut.options || {});
                } else {
                    clearTimeout(clickTimer);
                    clickTimer = setTimeout(() => { }, 220);
                }
            });
            button.addEventListener("keydown", event => {
                if (event.key === "Enter") desktopApi.openApp(shortcut.appId, shortcut.options || {});
            });
            iconContainer.append(button);
        });
    }

    function renderStartMenu() {
        startMenu.replaceChildren();
        const items = [
            ["assets/icons/folder.svg", "Programs", null],
            ["assets/icons/folder.svg", "My Projects", "projects"],
            ["assets/icons/my-computer.svg", "My Computer", "explorer"],
            ["assets/icons/aim.svg", "AOL Instant Messenger", "aim"],
            ["assets/icons/notepad.svg", "Notepad", "notepad"],
            ["▣", "MS-DOS Prompt", "terminal"],
            ["assets/icons/dialup.svg", "Dial-Up Networking", "dialup"],
            ["assets/icons/internet-explorer.svg", "Internet Explorer", "internet-explorer"],
            ["⚙️", "Settings", "control-panel"],
            ["ⓘ", "About", "about"],
        ];
        for (const [icon, label, appId] of items) {
            if (label === "Programs") {
                const row = document.createElement("button");
                row.innerHTML = `<span>▸</span><span>Programs</span>`;
                row.addEventListener("click", () => {
                    const first = apps.get("aim");
                    if (first) desktopApi.openApp("aim");
                });
                startMenu.append(row);
                const separator = document.createElement("div");
                separator.className = "menu-separator";
                startMenu.append(separator);
                continue;
            }
            const button = document.createElement("button");
            const iconElement = createIcon(icon, "start-menu-icon");
            iconElement.setAttribute("aria-hidden", "true");

            const labelElement = document.createElement("span");
            labelElement.textContent = label;

            button.append(iconElement, labelElement);
            button.addEventListener("click", () => {
                startMenu.hidden = true;
                document.querySelector("#start-button").setAttribute("aria-expanded", "false");
                desktopApi.openApp(appId);
            });
            startMenu.append(button);
        }
    }
    return desktopApi;
}