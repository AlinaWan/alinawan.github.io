import { virtualFileSystem as fs } from "../system/filesystem.js";

export function createTerminalApp() {
    return {
        id: "terminal", title: "MS-DOS Prompt", icon: "assets/icons/ms-dos.svg",
        open({ desktop }) {
            const win = desktop.createWindow({ title: "MS-DOS Prompt", icon: "assets/icons/ms-dos.svg", width: 520, height: 310, minWidth: 300, minHeight: 200 });
            const root = document.createElement("div");
            root.className = "terminal";
            root.innerHTML = `<div class="terminal-output">Microsoft(R) Windows 98\n(C)Copyright Microsoft Corp 1981-1998.\n\nType HELP for a list of commands.\n\n</div><form class="terminal-form"><label>C:\\&gt;</label><input autocomplete="off" spellcheck="false" aria-label="Command"></form>`;
            const output = root.querySelector(".terminal-output");
            const input = root.querySelector("input");
            let cwd = "C:\\";
            function print(text) { output.textContent += `${text}\n`; output.scrollTop = output.scrollHeight; }
            function command(raw) {
                const [verbRaw, ...rest] = raw.trim().split(/\s+/);
                const verb = (verbRaw || "").toLowerCase();
                const arg = rest.join(" ");
                if (!verb) return;
                if (verb === "help") print("HELP  DIR  CD  CLS  TYPE  VER  PROJECTS  ABOUT  EXIT");
                else if (verb === "ver") print("Microsoft Windows 98 [Portfolio Edition]");
                else if (verb === "cls") output.textContent = "";
                else if (verb === "dir") {
                    const entries = fs.list(cwd);
                    print(entries ? entries.map(e => `${e.type === "directory" ? "<DIR>      " : "           "}${e.name}`).join("\n") : "File not found.");
                } else if (verb === "cd") {
                    const next = arg ? fs.normalize(cwd.endsWith("\\") ? cwd + arg : cwd + "\\" + arg) : "C:\\";
                    if (fs.get(next)?.type === "directory") cwd = next;
                    else print("The system cannot find the path specified.");
                } else if (verb === "type") {
                    const path = fs.normalize(cwd.endsWith("\\") ? cwd + arg : cwd + "\\" + arg);
                    const file = fs.get(path);
                    print(file?.type === "file" ? file.content : "The system cannot find the file specified.");
                } else if (verb === "projects") desktop.openApp("projects");
                else if (verb === "about") desktop.openApp("about");
                else if (verb === "exit") win.close();
                else print(`Bad command or file name: ${verbRaw}`);
            }
            root.querySelector("form").addEventListener("submit", event => {
                event.preventDefault();
                const raw = input.value;
                print(`${cwd}>${raw}`);
                input.value = "";
                command(raw);
                root.querySelector("label").textContent = `${cwd}>`;
            });
            win.content.append(root);
            input.focus();
            return win;
        }
    };
}