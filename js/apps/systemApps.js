export function createAboutApp() {
    return {
        id: "about", title: "About this computer", icon: "ⓘ",
        open({ desktop }) {
            const win = desktop.createWindow({ title: "About this computer", icon: "ⓘ", width: 340, height: 245, minWidth: 260, minHeight: 180 });
            const root = document.createElement("div");
            root.style.cssText = "padding:14px;line-height:1.5;";
            root.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
        <img
            src="assets/icons/my-computer.svg"
            alt=""
            style="width:34px;height:34px;object-fit:contain"
        >
        <div>
            <strong>Angelina's Computer</strong><br>
            Windows 98 Portfolio Edition
        </div>
    </div>
    <hr>
    <p>A small interactive portfolio inspired by late-'90s and early-2000s personal computing.</p>
    <p>Explore the desktop, open applications, and browse the virtual filesystem.</p>
    <p>Version 0.1 · Built with HTML, CSS, and JavaScript</p>
`;
            win.content.append(root);
            return win;
        }
    };
}
export function createControlPanelApp() {
    return {
        id: "control-panel", title: "Control Panel", icon: "⚙️",
        open({ desktop }) {
            const win = desktop.createWindow({ title: "Control Panel", icon: "⚙️", width: 360, height: 270, minWidth: 270, minHeight: 200 });
            const root = document.createElement("div");
            root.style.cssText = "padding:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;";
            root.innerHTML = `<button class="system-button" data-wallpaper="#008080">🟦 Classic Teal</button><button class="system-button" data-wallpaper="#000080">🌌 Midnight Blue</button><button class="system-button" data-wallpaper="#3b536f">🌫️ Steel Blue</button><button class="system-button" data-wallpaper="#5b6b42">🌲 Olive Green</button><p style="grid-column:1/-1;margin:6px 0">Choose a desktop color. More personalization options can be added here later.</p>`;
            root.querySelectorAll("[data-wallpaper]").forEach(button => button.addEventListener("click", () => {
                document.querySelector("#desktop").style.background = button.dataset.wallpaper;
                localStorage.setItem("win98-wallpaper", button.dataset.wallpaper);
            }));
            const saved = localStorage.getItem("win98-wallpaper");
            if (saved) document.querySelector("#desktop").style.background = saved;
            win.content.append(root);
            return win;
        }
    };
}