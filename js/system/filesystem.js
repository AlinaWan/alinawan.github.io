const files = {
    "C:\\": { type: "directory", children: ["Documents", "Projects", "Windows"] },
    "C:\\Documents": { type: "directory", children: ["About Me.txt", "Contact.txt"] },
    "C:\\Documents\\About Me.txt": { type: "file", name: "About Me.txt", content: "Hi, I'm Angelina.\n\nWelcome to my little corner of the World Wide Web.\n\nThis is a Windows 98-inspired interactive portfolio. Explore the desktop, open applications, and have a look around.\n\nThis is currently a work in progress, so most things are still being developed. More about me and my projects will go here.\n\nFor the best experience, view this on a desktop browser." },
    "C:\\Documents\\Contact.txt": { type: "file", name: "Contact.txt", content: "Contact\n=======\n\nGitHub: https://github.com/AlinaWan\n\nReplace this file with your preferred contact links." },
    "C:\\Projects": { type: "directory", children: ["Livia", "Hazel", "you"] },
    "C:\\Projects\\Livia": { type: "directory", children: ["README.txt"] },
    "C:\\Projects\\Livia\\README.txt": { type: "file", name: "README.txt", content: "Livia\n=====\n\nAn open-source C# automation library for building Roblox macros and applications.\n\nRepository: https://github.com/AlinaWan/Livia" },
    "C:\\Projects\\Hazel": { type: "directory", children: ["README.txt"] },
    "C:\\Projects\\Hazel\\README.txt": { type: "file", name: "README.txt", content: "Hazel\n=====\n\nA programming language and compiler project." },
    "C:\\Projects\\you": { type: "directory", children: ["README.txt"] },
    "C:\\Projects\\you\\README.txt": { type: "file", name: "README.txt", content: "you\n===\n\nA small interactive web project about memories and little things left unsaid.\n\nRepository: https://github.com/AlinaWan/you" },
    "C:\\Windows": { type: "directory", children: ["win.ini", "readme.txt"] },
    "C:\\Windows\\win.ini": { type: "file", name: "win.ini", content: "[windows]\nload=\nrun=\n\n[desktop]\nWallpaper=(None)\nTileWallpaper=1\n" },
    "C:\\Windows\\readme.txt": { type: "file", name: "readme.txt", content: "Welcome to Windows 98.\n\nThis is my portfolio simulation!" },
};

function normalizePath(path) {
    let normalized = String(path || "C:\\").replaceAll("/", "\\").trim();
    if (/^[A-Za-z]:$/.test(normalized)) normalized += "\\";
    if (!/^[A-Za-z]:\\/.test(normalized)) normalized = `C:\\${normalized}`;
    normalized = normalized.replace(/\\{2,}/g, "\\");
    const parts = normalized.split("\\");
    const result = [];
    for (const part of parts) {
        if (!part || part.endsWith(":")) { if (part) result.push(part); continue; }
        if (part === ".") continue;
        if (part === "..") { if (result.length > 1) result.pop(); continue; }
        result.push(part);
    }
    let value = result.join("\\");
    if (/^[A-Za-z]:$/.test(value)) value += "\\";
    return value;
}

export const virtualFileSystem = {
    normalize: normalizePath,
    get(path) { return files[normalizePath(path)] ?? null; },
    list(path) {
        const normalized = normalizePath(path);
        const entry = files[normalized];
        if (!entry || entry.type !== "directory") return null;
        return entry.children.map(name => {
            const childPath = normalized.endsWith("\\") ? normalized + name : normalized + "\\" + name;
            return { name, path: childPath, ...files[childPath] };
        });
    },
    write(path, content) {
        const normalized = normalizePath(path);
        const name = normalized.split("\\").at(-1);
        files[normalized] = { type: "file", name, content: String(content) };
        const parent = normalized.slice(0, normalized.lastIndexOf("\\"));
        const parentPath = parent.endsWith(":") ? parent + "\\" : parent;
        const parentEntry = files[parentPath];
        if (parentEntry?.type === "directory" && !parentEntry.children.includes(name)) parentEntry.children.push(name);
        return normalized;
    },
    entries() { return files; }
};