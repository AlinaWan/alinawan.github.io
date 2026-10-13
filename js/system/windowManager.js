const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/**
 * Owns window lifecycle and window chrome. Apps provide content, not window behavior.
 * Public API: createWindow, focusWindow, minimizeWindow, restoreWindow, closeWindow.
 */
export function createWindowManager({ layer, taskbar }) {
    const windows = new Map();
    let nextId = 1;
    let topZ = 10;
    let cascade = 0;

    function createIcon(icon, className) {
        if (typeof icon === "string" &&
            /\.(?:svg|png|jpe?g|gif|webp|ico)(?:[?#].*)?$/i.test(icon)) {
            const image = document.createElement("img");
            image.className = className;
            image.src = icon;
            image.alt = "";
            image.draggable = false;
            return image;
        }

        const element = document.createElement("span");
        element.className = className;
        element.textContent = icon || "▣";
        return element;
    }

    function renderTaskbar() {
        taskbar.replaceChildren();
        for (const win of windows.values()) {
            const button = document.createElement("button");
            button.className = `taskbar-window${win.minimized ? "" : win.id === activeId ? " active" : ""}`;
            button.type = "button";
            button.title = win.title;
            const icon = createIcon(win.icon, "taskbar-window-icon");
            const label = document.createElement("span");
            label.className = "taskbar-label";
            label.textContent = win.title;
            button.append(icon, label);
            button.addEventListener("click", () => {
                if (win.minimized) restoreWindow(win.id);
                else if (activeId === win.id) minimizeWindow(win.id);
                else focusWindow(win.id);
            });
            taskbar.append(button);
        }
    }

    let activeId = null;

    function focusWindow(id) {
        const win = windows.get(id);
        if (!win) return;
        activeId = id;
        for (const entry of windows.values()) {
            entry.element.classList.toggle("is-inactive", entry.id !== id);
        }
        win.minimized = false;
        win.element.hidden = false;
        win.element.style.zIndex = String(++topZ);
        renderTaskbar();
    }

    function minimizeWindow(id) {
        const win = windows.get(id);
        if (!win) return;
        win.minimized = true;
        win.element.hidden = true;
        if (activeId === id) {
            activeId = [...windows.values()].filter(w => !w.minimized && w.id !== id).at(-1)?.id ?? null;
            if (activeId) focusWindow(activeId);
        }
        renderTaskbar();
    }

    function restoreWindow(id) {
        const win = windows.get(id);
        if (!win) return;
        win.minimized = false;
        win.element.hidden = false;
        focusWindow(id);
    }

    function closeWindow(id) {
        const win = windows.get(id);
        if (!win) return;
        win.element.remove();
        windows.delete(id);
        if (activeId === id) {
            activeId = [...windows.values()].filter(w => !w.minimized).at(-1)?.id ?? null;
            if (activeId) focusWindow(activeId);
        }
        renderTaskbar();
        win.onClose?.();
    }

    function makeDraggable(element, handle, id) {
        let drag = null;
        handle.addEventListener("pointerdown", event => {
            if (event.button !== 0 || event.target.closest("button")) return;
            const win = windows.get(id);
            if (!win || win.maximized) return;
            focusWindow(id);
            const rect = element.getBoundingClientRect();
            drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
            handle.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        handle.addEventListener("pointermove", event => {
            if (!drag || event.pointerId !== drag.pointerId) return;
            const maxLeft = Math.max(0, layer.clientWidth - 90);
            const maxTop = Math.max(0, layer.clientHeight - 34);
            const left = clamp(drag.left + event.clientX - drag.x, 0, maxLeft);
            const top = clamp(drag.top + event.clientY - drag.y, 0, maxTop);
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
        });
        const stop = event => { if (drag?.pointerId === event.pointerId) drag = null; };
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);
        handle.addEventListener("dblclick", event => {
            if (!event.target.closest("button")) toggleMaximize(id);
        });
    }

    function makeResizable(element, grip, id) {
        let resize = null;
        grip.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;
            const win = windows.get(id);
            if (!win || win.maximized) return;
            focusWindow(id);
            const rect = element.getBoundingClientRect();
            resize = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, width: rect.width, height: rect.height };
            grip.setPointerCapture(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
        });
        grip.addEventListener("pointermove", event => {
            if (!resize || event.pointerId !== resize.pointerId) return;
            const win = windows.get(id);
            const width = clamp(resize.width + event.clientX - resize.x, win.minWidth, layer.clientWidth);
            const height = clamp(resize.height + event.clientY - resize.y, win.minHeight, layer.clientHeight);
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
        });
        const stop = event => { if (resize?.pointerId === event.pointerId) resize = null; };
        grip.addEventListener("pointerup", stop);
        grip.addEventListener("pointercancel", stop);
    }

    function toggleMaximize(id) {
        const win = windows.get(id);
        if (!win) return;
        if (!win.maximized) {
            win.previousRect = {
                left: win.element.style.left, top: win.element.style.top,
                width: win.element.style.width, height: win.element.style.height
            };
            Object.assign(win.element.style, { left: "0px", top: "0px", width: "100%", height: "100%" });
            win.maximized = true;
        } else {
            Object.assign(win.element.style, win.previousRect);
            win.maximized = false;
        }
        focusWindow(id);
    }

    function createWindow(options) {
        const id = `window-${nextId++}`;
        const offset = (cascade++ % 7) * 24;
        const element = document.createElement("section");
        element.className = "window";
        element.dataset.windowId = id;
        element.style.left = `${Math.max(0, options.x ?? 70 + offset)}px`;
        element.style.top = `${Math.max(0, options.y ?? 42 + offset)}px`;
        element.style.width = `${options.width ?? 360}px`;
        element.style.height = `${options.height ?? 300}px`;
        const titlebar = document.createElement("header");
        titlebar.className = "window-titlebar";
        const titleIcon = createIcon(options.icon, "window-title-icon");
        const title = document.createElement("span");
        title.className = "window-title";
        title.textContent = options.title || "Application";
        const controls = document.createElement("div");
        controls.className = "window-controls";
        const min = document.createElement("button");
        min.className = "window-control";
        min.type = "button"; min.textContent = "_"; min.title = "Minimize";
        min.setAttribute("aria-label", `Minimize ${options.title || "window"}`);
        min.addEventListener("click", () => minimizeWindow(id));
        const max = document.createElement("button");
        max.className = "window-control";
        max.type = "button"; max.textContent = "□"; max.title = "Maximize";
        max.setAttribute("aria-label", `Maximize ${options.title || "window"}`);
        max.addEventListener("click", () => toggleMaximize(id));
        const close = document.createElement("button");
        close.className = "window-control";
        close.type = "button"; close.textContent = "×"; close.title = "Close";
        close.setAttribute("aria-label", `Close ${options.title || "window"}`);
        close.addEventListener("click", () => closeWindow(id));
        controls.append(min, max, close);
        titlebar.append(titleIcon, title, controls);
        const content = document.createElement("div");
        content.className = "window-content";
        element.append(titlebar, content);
        if (options.resizable !== false) {
            const grip = document.createElement("div");
            grip.className = "window-resize";
            grip.setAttribute("aria-hidden", "true");
            element.append(grip);
            makeResizable(element, grip, id);
        }
        layer.append(element);
        const win = {
            id, element, content, titlebar, title: options.title || "Application",
            icon: options.icon || "▣", minimized: false, maximized: false,
            minWidth: options.minWidth ?? 230, minHeight: options.minHeight ?? 120,
            onClose: options.onClose
        };
        windows.set(id, win);
        makeDraggable(element, titlebar, id);
        element.addEventListener("pointerdown", () => focusWindow(id));
        focusWindow(id);
        return {
            id, element, content,
            setTitle(value) { win.title = value; title.textContent = value; renderTaskbar(); },
            focus: () => focusWindow(id),
            minimize: () => minimizeWindow(id),
            restore: () => restoreWindow(id),
            close: () => closeWindow(id),
            maximize: () => toggleMaximize(id)
        };
    }

    document.addEventListener("keydown", event => {
        if (event.altKey && event.key === "Tab") {
            const visible = [...windows.values()].filter(w => !w.minimized);
            if (visible.length > 1) {
                event.preventDefault();
                const index = visible.findIndex(w => w.id === activeId);
                focusWindow(visible[(index + 1) % visible.length].id);
            }
        }
    });

    return { createWindow, focusWindow, minimizeWindow, restoreWindow, closeWindow, get windows() { return windows; } };
}