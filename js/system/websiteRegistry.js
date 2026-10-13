
const websites = {
    "www.alinawan.com": {
        title: "Angelina's Home Page",
        path: "websites/alinawan/index.html"
    },
    "livia.alinawan.com": {
        title: "Livia",
        path: "websites/livia/index.html"
    },
    "hazel.alinawan.com": {
        title: "Hazel",
        path: "websites/hazel/index.html"
    },
    "you.alinawan.com": {
        title: "you",
        path: "websites/you/index.html"
    }
};

export function resolveWebsite(input, baseUrl = "http://www.alinawan.com/") {
    let url;

    try {
        url = new URL(input, baseUrl);
    } catch {
        return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
    }

    const website = websites[url.hostname.toLowerCase()];
    if (!website) return null;

    const basePath = website.path.slice(
        0,
        website.path.lastIndexOf("/") + 1
    );

    const pathname = decodeURIComponent(url.pathname);
    let relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");

    // Keep navigation within the website's own directory.
    const segments = relativePath.split("/");
    if (segments.some(segment => segment === "." || segment === "..")) {
        return null;
    }

    // A hostname maps to a site directory, not an arbitrary local file.
    const filePath = relativePath === "index.html"
        ? website.path
        : basePath + relativePath;

    return {
        url,
        website,
        filePath
    };
}

export function getWebsiteHosts() {
    return Object.keys(websites);
}
