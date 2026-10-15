const files = {
    "C:\\": { type: "directory", children: ["Documents", "Projects", "Windows"] },
    "C:\\Documents": { type: "directory", children: ["About Me.txt", "Contact.txt"] },
    "C:\\Documents\\About Me.txt": { type: "file", name: "About Me.txt", content: "Hi, I'm Angelina.\n\nWelcome to my little corner of the World Wide Web.\n\nThis is a Windows 98-inspired interactive portfolio. Explore the desktop, open applications, and have a look around.\n\nThis is currently a work in progress, so most things are still being developed. More about me and my projects will go here.\n\nTip: You can use MS-DOS to interact with the filesystem and run scripts, and Internet Explorer to explore websites! For the best experience, view this on a desktop browser." },
    "C:\\Documents\\Contact.txt": { type: "file", name: "Contact.txt", content: "Contact\n=======\n\nGitHub: https://github.com/AlinaWan" },
    "C:\\Windows": { type: "directory", children: ["win.ini", "readme.txt"] },
    "C:\\Windows\\win.ini": { type: "file", name: "win.ini", content: "[windows]\nload=\nrun=\n\n[desktop]\nWallpaper=(None)\nTileWallpaper=1\n" },
    "C:\\Windows\\readme.txt": { type: "file", name: "readme.txt", content: "Welcome to Windows 98.\n\nThis is my portfolio simulation!" },
    "C:\\Projects": { type: "directory", children: ["Python"] },
    "C:\\Projects\\Python": { type: "directory", children: [] },
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

async function loadRemoteFile(path, url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to load ${path}: HTTP ${response.status}`
        );
    }

    const content = await response.text();
    const normalized = normalizePath(path);
    const name = normalized.split("\\").at(-1);

    files[normalized] = {
        type: "file",
        name,
        content
    };

    const parent = normalized.slice(
        0,
        normalized.lastIndexOf("\\")
    );
    const parentPath = parent.endsWith(":")
        ? parent + "\\"
        : parent;

    const parentEntry = files[parentPath];

    if (
        parentEntry?.type === "directory" &&
        !parentEntry.children.includes(name)
    ) {
        parentEntry.children.push(name);
    }

    return normalized;
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

export const filesystemReady = Promise.all([
    loadRemoteFile(
        "C:\\Projects\\Python\\bloxburg_solar_panel_calculator.py",
        "https://gist.githubusercontent.com/AlinaWan/feebbc37f60ba34a992d8b2cb6150c1e/raw/ccaad2e0e20c6b200a55e86baf28240fa1cf7605/bloxburg_solar_panel_calculator_v2.py"
    ),
    loadRemoteFile(
        "C:\\Projects\\Python\\conway_wechsler_converter.py",
        "https://gist.githubusercontent.com/AlinaWan/eb6cb03636ebd408f62f3dcd4800ad35/raw/9d5e70e521b301353476a39f0969b638af52a8ec/conway_wechsler_converter.py"
    )
]).catch(error => {
    console.error("Failed to load remote filesystem files:", error);
});
