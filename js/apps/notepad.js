import { virtualFileSystem as fs } from "../system/filesystem.js";

export function createNotepadApp() {
    return {
        id: "notepad", title: "Notepad", icon: "assets/icons/notepad.svg",
        open({ desktop, options }) {
            const filePath = options.filePath || null;
            const entry = filePath ? fs.get(filePath) : null;
            const win = desktop.createWindow({ title: filePath ? `${entry?.name || filePath} - Notepad` : "Untitled - Notepad", icon: "assets/icons/notepad.svg", width: 480, height: 330, minWidth: 270, minHeight: 180 });
            const root = document.createElement("div");
            root.className = "notepad";
            root.innerHTML = `<div class="app-menu-bar"><button data-action="save">File</button><button>Edit</button><button>Search</button><button>Help</button><span style="flex:1"></span><button data-action="save">Save</button></div><textarea spellcheck="false" aria-label="Document contents"></textarea><div class="app-statusbar"><span>For help, press F1</span><span>Ln 1, Col 1</span></div>`;
            const textarea = root.querySelector("textarea");
            textarea.value = entry?.content || "";
            root.addEventListener("click", event => {
                if (event.target.closest('[data-action="save"]')) {
                    if (filePath) {
                        fs.write(filePath, textarea.value);
                        win.setTitle(`${fs.get(filePath)?.name || filePath} - Notepad`);
                    } else {
                        const path = prompt("Save as (virtual path):", "C:\\Documents\\New Text Document.txt");
                        if (path) {
                            fs.write(path, textarea.value);
                            win.setTitle(`${fs.get(path)?.name || path} - Notepad`);
                        }
                    }
                }
            });
            textarea.addEventListener("input", () => {
                root.querySelector(".app-statusbar span:last-child").textContent = `Ln ${textarea.value.slice(0, textarea.selectionStart).split("\n").length}, Col ${textarea.selectionStart - textarea.value.lastIndexOf("\n", textarea.selectionStart - 1)}`;
            });
            win.content.append(root);
            return win;
        }
    };
}