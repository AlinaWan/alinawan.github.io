
import { resolveWebsite } from "../system/websiteRegistry.js";

const HOME_URL = "http://www.alinawan.com/";

function makeButton(label, title, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ie-toolbar-button";
    button.textContent = label;
    button.title = title;
    button.addEventListener("click", onClick);
    return button;
}

export function createInternetExplorerApp() {
    return {
        id: "internet-explorer",
        title: "Internet Explorer",
        icon: "assets/icons/internet-explorer.svg",

        open({ desktop, options = {} }) {
            const win = desktop.createWindow({
                title: "Internet Explorer",
                icon: "assets/icons/internet-explorer.svg",
                width: 850,
                height: 600,
                minWidth: 500,
                minHeight: 350
            });

            const root = document.createElement("div");
            root.className = "ie-app";

            const toolbar = document.createElement("div");
            toolbar.className = "ie-toolbar";

            const addressRow = document.createElement("form");
            addressRow.className = "ie-address-row";

            const addressLabel = document.createElement("label");
            addressLabel.textContent = "Address";
            addressLabel.className = "ie-address-label";

            const address = document.createElement("input");
            address.type = "text";
            address.className = "ie-address";
            address.spellcheck = false;
            address.autocomplete = "off";
            address.setAttribute("aria-label", "Address");

            const goButton = document.createElement("button");
            goButton.type = "submit";
            goButton.textContent = "Go";
            goButton.className = "ie-go-button";

            addressRow.append(addressLabel, address, goButton);

            const viewport = document.createElement("div");
            viewport.className = "ie-viewport";

            const frame = document.createElement("iframe");
            frame.className = "ie-page";
            frame.title = "Web page";
            frame.setAttribute("sandbox", "allow-same-origin allow-forms");
            frame.referrerPolicy = "no-referrer";

            const status = document.createElement("div");
            status.className = "ie-status";
            status.textContent = "Ready";

            viewport.append(frame);
            toolbar.append(addressRow);
            root.append(toolbar, viewport, status);
            win.content.append(root);

            const history = [];
            let historyIndex = -1;
            let currentUrl = HOME_URL;
            let navigationId = 0;
            let isLoading = false;

            function setStatus(message) {
                status.textContent = message;
            }

            function updateButtons() {
                backButton.disabled = historyIndex <= 0;
                forwardButton.disabled =
                    historyIndex < 0 || historyIndex >= history.length - 1;
            }

            function setLoading(loading) {
                isLoading = loading;
                refreshButton.textContent = loading ? "Stop" : "Refresh";
                refreshButton.title = loading ? "Stop" : "Refresh";
                setStatus(loading ? "Opening page..." : "Ready");
            }

            function showError(message, url) {
                frame.removeAttribute("src");
                frame.srcdoc = `
                    <!DOCTYPE html>
                    <html>
                    <head><title>Page Not Found</title></head>
                    <body style="font: 16px Arial; margin: 32px; color: #000; background: #fff">
                        <h1>The page cannot be displayed</h1>
                        <p>${message}</p>
                        <p>${url}</p>
                    </body>
                    </html>
                `;
                setLoading(false);
            }

            function navigate(input, mode = "push") {
                const resolved = resolveWebsite(input, currentUrl);

                if (!resolved) {
                    let requested;
                    try {
                        requested = new URL(input, currentUrl);
                    } catch {
                        requested = { href: String(input) };
                    }

                    currentUrl = requested.href;
                    address.value = currentUrl;
                    showError(
                        "This address is not part of the simulated Internet.",
                        currentUrl
                    );
                    return;
                }

                currentUrl = resolved.url.href;
                address.value = currentUrl;

                if (mode === "push") {
                    history.splice(historyIndex + 1);
                    history.push(currentUrl);
                    historyIndex = history.length - 1;
                } else if (mode === "replace" && historyIndex >= 0) {
                    history[historyIndex] = currentUrl;
                }

                updateButtons();
                setLoading(true);

                const thisNavigation = ++navigationId;
                frame.onload = () => {
                    if (thisNavigation !== navigationId) return;
                    setLoading(false);
                    attachLinkHandling();
                };

                // Resolve against the real page URL so the site and its
                // relative CSS/images work from the project subdirectory.
                frame.removeAttribute("srcdoc");
                frame.src = new URL(resolved.filePath, document.baseURI).href;
            }

            function attachLinkHandling() {
                let page;
                try {
                    page = frame.contentDocument;
                } catch {
                    return;
                }
                if (!page) return;

                page.addEventListener("click", event => {
                    const anchor = event.target.closest("a[href]");
                    if (!anchor || event.defaultPrevented) return;

                    // Leave modified clicks and non-left clicks alone.
                    if (event.button !== 0 ||
                        event.ctrlKey || event.metaKey ||
                        event.shiftKey || event.altKey) return;

                    const target = anchor.getAttribute("target");
                    if (target && target.toLowerCase() !== "_self") return;

                    const rawHref = anchor.getAttribute("href");
                    if (!rawHref ||
                        rawHref.startsWith("#") ||
                        /^(mailto:|tel:|javascript:)/i.test(rawHref)) return;

                    let destination;
                    try {
                        destination = new URL(rawHref, currentUrl);
                    } catch {
                        return;
                    }

                    event.preventDefault();

                    if (resolveWebsite(destination.href, currentUrl)) {
                        navigate(destination.href);
                    } else if (
                        destination.protocol === "http:" ||
                        destination.protocol === "https:"
                    ) {
                        // External links leave the simulated browser.
                        window.open(destination.href, "_blank", "noopener");
                    }
                }, true);
            }

            const backButton = makeButton("Back", "Back", () => {
                if (historyIndex <= 0) return;
                historyIndex--;
                navigate(history[historyIndex], "none");
            });

            const forwardButton = makeButton("Forward", "Forward", () => {
                if (historyIndex >= history.length - 1) return;
                historyIndex++;
                navigate(history[historyIndex], "none");
            });

            const stopButton = makeButton("Stop", "Stop", () => {
                navigationId++;
                try {
                    frame.contentWindow.stop();
                } catch {
                    // A navigation may already have replaced the document.
                }
                setLoading(false);
            });

            const refreshButton = makeButton("Refresh", "Refresh", () => {
                if (isLoading) {
                    stopButton.click();
                    return;
                }
                navigate(currentUrl, "none");
            });

            const homeButton = makeButton("Home", "Home", () => {
                navigate(HOME_URL);
            });

            toolbar.prepend(backButton, forwardButton, stopButton, refreshButton, homeButton);
            addressRow.addEventListener("submit", event => {
                event.preventDefault();
                navigate(address.value.trim());
            });

            win.element.addEventListener("keydown", event => {
                if (event.key === "Enter" &&
                    document.activeElement === address) {
                    event.preventDefault();
                    navigate(address.value.trim());
                }
            });

            win.element.addEventListener("click", event => {
                if (event.target === address) address.select();
            });

            updateButtons();
            navigate(options.url || HOME_URL);
        }
    };
}
