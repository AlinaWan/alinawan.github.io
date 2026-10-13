import { virtualFileSystem as fs } from "../system/filesystem.js";

export function createExplorerApp() {
    return {
        id: "explorer", title: "My Computer", icon: "assets/icons/my-computer.svg",
        open({ desktop, options }) {
            const initialPath = options.path || "C:\\";
            const win = desktop.createWindow({ title: initialPath === "C:\\" ? "My Computer" : initialPath, icon: "assets/icons/my-computer.svg", width: 540, height: 390, minWidth: 330, minHeight: 250 });
            let currentPath = fs.normalize(initialPath);
            let selectedPath = null;

            function createFileIcon(type, name = "") {
                if (type !== "directory" && type !== "computer") {
                    const emoji = document.createElement("span");
                    emoji.className = "file-icon";
                    emoji.textContent = name.toLowerCase().endsWith(".txt") ? "📄" : "📃";
                    return emoji;
                }

                const image = document.createElement("img");
                image.className = "file-icon";
                image.src = new URL(
                    type === "computer"
                        ? "assets/icons/my-computer.svg"
                        : "assets/icons/folder.svg",
                    document.baseURI
                ).href;
                image.alt = "";
                image.draggable = false;
                return image;
            }

            const root = document.createElement("div");
            root.style.cssText = "height:100%;display:flex;flex-direction:column;";
            root.innerHTML = `
        <div class="app-menu-bar"><button>File</button><button>Edit</button><button>View</button><button>Favorites</button><button>Help</button></div>
        <div class="app-toolbar"><button class="system-button" data-action="up">Up</button><button class="system-button" data-action="back">Back</button><button class="system-button" data-action="refresh">Refresh</button></div>
        <div class="explorer-address"><strong>Address</strong><input class="inset" aria-label="Address"><button class="system-button" data-action="go">Go</button></div>
        <div class="explorer-layout" style="flex:1;min-height:0;">
          <nav class="explorer-tree"><strong>All Folders</strong><div class="explorer-tree-items" style="margin-top:8px"></div></nav>
          <div class="explorer-files" aria-label="Files"></div>
        </div>
        <div class="app-statusbar"><span class="explorer-count"></span><span>Windows Explorer</span></div>`;
            const address = root.querySelector("input");
            const filePane = root.querySelector(".explorer-files");
            const status = root.querySelector(".explorer-count");

            const tree = root.querySelector(".explorer-tree-items");

            const treeFolders = [
                { path: "C:\\", name: "My Computer", type: "computer" },
                { path: "C:\\Documents", name: "Documents", type: "directory" },
                { path: "C:\\Projects", name: "Projects", type: "directory" },
                { path: "C:\\Windows", name: "Windows", type: "directory" }
            ];

            for (const folder of treeFolders) {
                const button = document.createElement("button");
                button.dataset.path = folder.path;

                button.append(
                    createFileIcon(folder.type),
                    document.createTextNode(folder.name)
                );

                tree.append(button);
            }

            function navigate(path) {
                const normalized = fs.normalize(path);
                const entry = fs.get(normalized);
                if (!entry || entry.type !== "directory") { status.textContent = "Folder not found"; return; }
                currentPath = normalized; selectedPath = null;
                address.value = currentPath;
                win.setTitle(currentPath === "C:\\" ? "My Computer" : currentPath);
                render();
            }
            function render() {
                const items = fs.list(currentPath) || [];
                filePane.replaceChildren();
                for (const item of items) {
                    const button = document.createElement("button");
                    button.className = "explorer-item";
                    const icon = createFileIcon(item.type, item.name);

                    const label = document.createElement("span");
                    label.textContent = item.name;

                    button.append(icon, label);
                    button.addEventListener("click", () => {
                        filePane.querySelectorAll(".explorer-item").forEach(node => node.classList.remove("selected"));
                        button.classList.add("selected"); selectedPath = item.path;
                    });
                    button.addEventListener("dblclick", () => {
                        if (item.type === "directory") navigate(item.path);
                        else desktop.openApp("notepad", { filePath: item.path });
                    });
                    filePane.append(button);
                }
                status.textContent = `${items.length} object(s)`;
            }
            root.addEventListener("click", event => {
                const action = event.target.closest("[data-action]")?.dataset.action;
                if (action === "go") navigate(address.value);
                if (action === "up") {
                    if (currentPath !== "C:\\") navigate(currentPath.replace(/\\[^\\]+\\?$/, "") || "C:\\");
                }
                if (action === "back") navigate("C:\\");
                if (action === "refresh") render();
                const treePath = event.target.closest("[data-path]")?.dataset.path;
                if (treePath) navigate(treePath);
            });
            address.addEventListener("keydown", event => { if (event.key === "Enter") navigate(address.value); });
            win.content.append(root);
            navigate(initialPath);
            return win;
        }
    };
}