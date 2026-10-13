
import { getOrInitEngine } from "../system/llm.js";

// TODO: Add prompts for each buddy to actually feel period correct
//       to the 1998 AIM IM era. Right now there is no prompt
//       so the model will just respond as a generic AI assistant.
const initialBuddies = [
    {
        id: "smarterchild",
        name: "SmarterChild",
        group: "Buddies",
        status: "online",
        profile: "your friend who's always got something to say. usually too much, tbh."
    },
    {
        id: "retrocoder98",
        name: "RetroCoder98",
        group: "Co-Workers",
        status: "online",
        profile: "building a homepage one animated GIF at a time."
    },
    {
        id: "websurfer97",
        name: "WebSurfer97",
        group: "Buddies",
        status: "away",
        profile: "probably downloading something. don't pick up the phone."
    },
    {
        id: "mom97",
        name: "Mom",
        group: "Family",
        status: "offline",
        profile: "if it's urgent, call the landline."
    }
];

const UI = {
    background: "#c0c0c0",
    borderLight: "#ffffff",
    borderDark: "#808080",
    text: "#000000",
    blue: "#000080",
    font: "Tahoma, Arial, sans-serif"
};

function setClassicStyle(element, styles) {
    Object.assign(element.style, styles);
}

function createClassicButton(text, { primary = false, width } = {}) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;

    setClassicStyle(button, {
        boxSizing: "border-box",
        minHeight: "24px",
        minWidth: width ? `${width}px` : "72px",
        padding: "2px 10px",
        font: `11px ${UI.font}`,
        color: UI.text,
        background: UI.background,
        border: "1px solid",
        borderColor: primary
            ? `${UI.borderDark} ${UI.borderLight} ${UI.borderLight} ${UI.borderDark}`
            : `${UI.borderLight} ${UI.borderDark} ${UI.borderDark} ${UI.borderLight}`,
        borderRadius: "0",
        cursor: "default"
    });

    button.addEventListener("pointerdown", () => {
        setClassicStyle(button, {
            borderColor: `${UI.borderDark} ${UI.borderLight} ${UI.borderLight} ${UI.borderDark}`
        });
    });

    button.addEventListener("pointerup", () => {
        setClassicStyle(button, {
            borderColor: primary
                ? `${UI.borderDark} ${UI.borderLight} ${UI.borderLight} ${UI.borderDark}`
                : `${UI.borderLight} ${UI.borderDark} ${UI.borderDark} ${UI.borderLight}`
        });
    });

    return button;
}

function createClassicInput({ value = "", multiline = false, placeholder = "" } = {}) {
    const input = document.createElement(multiline ? "textarea" : "input");

    input.value = value;
    input.placeholder = placeholder;

    setClassicStyle(input, {
        boxSizing: "border-box",
        width: "100%",
        minWidth: "0",
        padding: "4px 5px",
        font: `12px ${UI.font}`,
        color: UI.text,
        background: "#ffffff",
        border: `1px solid ${UI.borderDark}`,
        borderTopColor: "#404040",
        borderLeftColor: "#404040",
        borderRadius: "0",
        outlineColor: UI.blue,
        resize: multiline ? "vertical" : "none"
    });

    if (multiline) {
        input.rows = 3;
    }

    return input;
}

function createInsetPanel() {
    const panel = document.createElement("div");

    setClassicStyle(panel, {
        background: UI.background,
        border: "1px solid",
        borderColor: `${UI.borderDark} ${UI.borderLight} ${UI.borderLight} ${UI.borderDark}`,
        padding: "10px",
        minWidth: "0"
    });

    return panel;
}

function createField(labelText, control) {
    const field = document.createElement("label");

    setClassicStyle(field, {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        font: `11px ${UI.font}`,
        color: UI.text,
        minWidth: "0"
    });

    const label = document.createElement("span");
    label.textContent = labelText;

    field.append(label, control);

    return field;
}

function createDialogContent() {
    const content = document.createElement("div");

    setClassicStyle(content, {
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        padding: "10px",
        background: UI.background,
        color: UI.text,
        font: `11px ${UI.font}`,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflow: "auto"
    });

    return content;
}

export function createAimApp() {
    return {
        id: "aim",
        title: "AOL Instant Messenger",
        icon: "assets/icons/aim.svg",

        open({ desktop }) {
            if (desktop._aimWindow) {
                desktop._aimWindow.focus();
                return desktop._aimWindow;
            }

            const buddies = initialBuddies.map(buddy => ({ ...buddy }));
            const chats = new Map();

            const settings = {
                screenName: "RetroUser97",
                awayMessage: "I'm away from my computer right now. BRB!",
                userStatus: "online",
                soundEnabled: Boolean(desktop.soundEnabled)
            };

            let selectedBuddyId = null;
            let setupWindow = null;

            const win = desktop.createWindow({
                title: "AOL Instant Messenger",
                icon: "assets/icons/aim.svg",
                width: 330,
                height: 505,
                minWidth: 285,
                minHeight: 420,
                onClose: () => {
                    desktop._aimWindow = null;
                }
            });

            desktop._aimWindow = win;

            const root = document.createElement("div");
            root.className = "aim-app";

            root.innerHTML = `
                <div class="app-menu-bar">
                    <button data-action="about">File</button>
                    <button data-action="setup">Edit</button>
                    <button data-action="add">People</button>
                    <button data-action="sound">Audio</button>
                    <button data-action="about">Help</button>
                </div>

                <div class="aim-banner">
                    <div style="display:flex;align-items:center;gap:8px">
                        <div class="aim-logo">AIM</div>
                        <div class="aim-user">
                            <strong style="color:#000080">AOL Instant Messenger</strong>
                            <br>
                            <span>Screen Name: <b class="screen-name"></b></span>
                        </div>
                    </div>
                    <button class="system-button" data-action="setup">Setup</button>
                </div>

                <div class="aim-controls">
                    <strong>Status:</strong>
                    <select class="inset status-select" aria-label="Your status">
                        <option value="online">Online</option>
                        <option value="away">Away</option>
                    </select>
                </div>

                <div class="app-toolbar">
                    <button class="system-button" data-action="online">Online</button>
                    <button class="system-button" data-action="add">+ Add Buddy</button>
                </div>

                <div class="buddy-list inset"></div>

                <div class="aim-actions">
                    <button class="system-button" data-action="im">IM</button>
                    <button class="system-button" data-action="info">Info</button>
                    <button class="system-button" data-action="away">Away</button>
                    <button class="system-button" data-action="chat">Chat</button>
                </div>

                <div class="app-statusbar">
                    <span class="buddy-count"></span>
                    <span data-sound-status></span>
                </div>
            `;

            const buddyList = root.querySelector(".buddy-list");

            function renderBuddies() {
                buddyList.replaceChildren();

                const groups = [...new Set(buddies.map(buddy => buddy.group))];
                let onlineCount = 0;

                for (const group of groups) {
                    const groupBuddies = buddies.filter(buddy => buddy.group === group);

                    const availableCount = groupBuddies.filter(
                        buddy => buddy.status !== "offline"
                    ).length;

                    onlineCount += availableCount;

                    const section = document.createElement("div");
                    section.className = "buddy-group";

                    const heading = document.createElement("button");
                    heading.className = "buddy-group-heading";

                    const rows = document.createElement("div");

                    function updateHeading() {
                        heading.textContent =
                            `${rows.hidden ? "▶" : "▼"} ${group} ` +
                            `(${availableCount}/${groupBuddies.length})`;
                    }

                    heading.addEventListener("click", () => {
                        rows.hidden = !rows.hidden;
                        updateHeading();
                    });

                    for (const buddy of groupBuddies) {
                        const row = document.createElement("button");

                        row.className =
                            `buddy-row${selectedBuddyId === buddy.id ? " selected" : ""}`;

                        const presence = document.createElement("span");
                        presence.className = `buddy-presence ${buddy.status}`;

                        const name = document.createElement("span");
                        name.textContent =
                            buddy.name + (buddy.status === "away" ? " (Away)" : "");

                        row.append(presence, name);

                        row.addEventListener("click", () => {
                            selectedBuddyId = buddy.id;
                            renderBuddies();
                        });

                        row.addEventListener("dblclick", () => openChat(buddy.id));

                        rows.append(row);
                    }

                    updateHeading();
                    section.append(heading, rows);
                    buddyList.append(section);
                }

                root.querySelector(".buddy-count").textContent =
                    `Buddies: ${onlineCount}/${buddies.length} Online`;

                root.querySelector(".screen-name").textContent = settings.screenName;
                root.querySelector(".status-select").value = settings.userStatus;

                root.querySelector("[data-sound-status]").textContent =
                    settings.soundEnabled ? "Sound ON" : "Sound OFF";
            }

            function updateChatScreenNames() {
                for (const chat of chats.values()) {
                    const label = chat.content.querySelector(".chat-screen-name");

                    if (label) {
                        label.textContent = settings.screenName;
                    }
                }
            }

            function setStatus(status) {
                settings.userStatus = status;
                renderBuddies();
            }

            function openClassicDialog({
                title,
                width = 330,
                height = 200,
                build,
                onClose
            }) {
                let closed = false;

                const dialog = desktop.createWindow({
                    title,
                    icon: "ⓘ",
                    width,
                    height,
                    minWidth: width,
                    minHeight: height,
                    onClose: () => {
                        closed = true;
                        onClose?.();
                    }
                });

                const content = createDialogContent();
                dialog.content.append(content);

                function close() {
                    if (closed) return;
                    closed = true;
                    dialog.close();
                }

                build({
                    content,
                    close,
                    dialog
                });

                return dialog;
            }

            function openInputDialog({
                title,
                label,
                value = "",
                multiline = false,
                width = 340,
                height = 185,
                submitText = "OK",
                validate,
                onSubmit
            }) {
                let input;

                const dialog = openClassicDialog({
                    title,
                    width,
                    height,

                    build({ content, close }) {
                        const panel = createInsetPanel();

                        input = createClassicInput({ value, multiline });
                        panel.append(createField(label, input));

                        const buttons = document.createElement("div");

                        setClassicStyle(buttons, {
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "6px",
                            marginTop: "auto"
                        });

                        const ok = createClassicButton(submitText, { primary: true });
                        const cancel = createClassicButton("Cancel");

                        function submit() {
                            const result = input.value.trim();

                            if (validate && !validate(result)) {
                                input.focus();
                                return;
                            }

                            onSubmit(result);
                            close();
                        }

                        ok.addEventListener("click", submit);
                        cancel.addEventListener("click", close);

                        input.addEventListener("keydown", event => {
                            if (event.key === "Escape") {
                                close();
                            } else if (event.key === "Enter" && !multiline) {
                                event.preventDefault();
                                submit();
                            } else if (
                                event.key === "Enter" &&
                                multiline &&
                                event.ctrlKey
                            ) {
                                event.preventDefault();
                                submit();
                            }
                        });

                        buttons.append(cancel, ok);
                        content.append(panel, buttons);
                    }
                });

                input?.focus();
                input?.select();

                return dialog;
            }

            function showSetup() {
                if (setupWindow) {
                    setupWindow.focus();
                    return setupWindow;
                }

                const draft = { ...settings };
                let activePage = "general";
                let dirty = false;

                const pages = [
                    { id: "general", label: "General" },
                    { id: "away", label: "Away Message" },
                    { id: "sounds", label: "Sounds" }
                ];

                let pagePanel;
                let navigation;
                let applyButton;

                setupWindow = desktop.createWindow({
                    title: "AIM Setup",
                    icon: "assets/icons/aim.svg",
                    width: 460,
                    height: 355,
                    minWidth: 430,
                    minHeight: 330,
                    onClose: () => {
                        setupWindow = null;
                    }
                });

                const content = createDialogContent();

                setClassicStyle(content, {
                    padding: "10px",
                    gap: "8px",
                    overflow: "hidden"
                });

                const intro = document.createElement("div");
                intro.textContent = "Change your AOL Instant Messenger preferences.";

                const body = document.createElement("div");

                setClassicStyle(body, {
                    display: "flex",
                    flex: "1",
                    minHeight: "0",
                    gap: "10px"
                });

                navigation = document.createElement("div");

                setClassicStyle(navigation, {
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    width: "118px",
                    flexShrink: "0"
                });

                pagePanel = createInsetPanel();

                setClassicStyle(pagePanel, {
                    flex: "1",
                    overflow: "auto",
                    padding: "12px"
                });

                const buttons = document.createElement("div");

                setClassicStyle(buttons, {
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "6px"
                });

                const okButton = createClassicButton("OK", { primary: true });
                const cancelButton = createClassicButton("Cancel");
                applyButton = createClassicButton("Apply");

                function markDirty() {
                    dirty = true;
                    applyButton.disabled = false;
                    applyButton.style.opacity = "1";
                }

                function addChangeListener(control, key, transform = value => value) {
                    control.addEventListener("input", () => {
                        draft[key] = transform(control.type === "checkbox"
                            ? control.checked
                            : control.value);
                        markDirty();
                    });

                    control.addEventListener("change", () => {
                        draft[key] = transform(control.type === "checkbox"
                            ? control.checked
                            : control.value);
                        markDirty();
                    });
                }

                function renderPage() {
                    pagePanel.replaceChildren();

                    for (const button of navigation.querySelectorAll("button")) {
                        button.style.fontWeight =
                            button.dataset.page === activePage ? "bold" : "normal";

                        button.style.textAlign = "left";
                        button.style.background =
                            button.dataset.page === activePage ? "#ffffff" : UI.background;
                    }

                    if (activePage === "general") {
                        const heading = document.createElement("strong");
                        heading.textContent = "General";

                        const description = document.createElement("p");
                        description.textContent = "Your screen name and online status.";
                        description.style.margin = "6px 0 12px";

                        const nameInput = createClassicInput({
                            value: draft.screenName
                        });

                        nameInput.maxLength = 64;
                        addChangeListener(nameInput, "screenName", value => value.trim());

                        const statusSelect = document.createElement("select");

                        for (const [value, label] of [
                            ["online", "Online"],
                            ["away", "Away"]
                        ]) {
                            const option = document.createElement("option");
                            option.value = value;
                            option.textContent = label;
                            statusSelect.append(option);
                        }

                        statusSelect.value = draft.userStatus;
                        statusSelect.style.cssText =
                            `width:100%;padding:3px;font:11px ${UI.font};`;

                        addChangeListener(statusSelect, "userStatus");

                        const nameField = createField("Screen Name:", nameInput);
                        const statusField = createField("My Status:", statusSelect);

                        setClassicStyle(pagePanel, {
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                        });

                        pagePanel.append(heading, description, nameField, statusField);
                    }

                    if (activePage === "away") {
                        const heading = document.createElement("strong");
                        heading.textContent = "Away Message";

                        const description = document.createElement("p");
                        description.textContent =
                            "This message is shown when someone messages you while you're away.";
                        description.style.margin = "6px 0 12px";

                        const messageInput = createClassicInput({
                            value: draft.awayMessage,
                            multiline: true
                        });

                        addChangeListener(messageInput, "awayMessage");

                        pagePanel.append(
                            heading,
                            description,
                            createField("Default Away Message:", messageInput)
                        );
                    }

                    if (activePage === "sounds") {
                        const heading = document.createElement("strong");
                        heading.textContent = "Sounds";

                        const description = document.createElement("p");
                        description.textContent =
                            "Choose whether AIM sounds are enabled.";
                        description.style.margin = "6px 0 12px";

                        const soundLabel = document.createElement("label");
                        const soundCheckbox = document.createElement("input");

                        soundCheckbox.type = "checkbox";
                        soundCheckbox.checked = draft.soundEnabled;

                        addChangeListener(soundCheckbox, "soundEnabled");

                        soundLabel.append(soundCheckbox, " Enable sounds");

                        pagePanel.append(heading, description, soundLabel);
                    }
                }

                for (const page of pages) {
                    const button = createClassicButton(page.label);
                    button.dataset.page = page.id;
                    button.style.width = "100%";

                    button.addEventListener("click", () => {
                        activePage = page.id;
                        renderPage();
                    });

                    navigation.append(button);
                }

                function commit() {
                    if (!draft.screenName.trim()) {
                        activePage = "general";
                        renderPage();

                        const nameInput = pagePanel.querySelector("input");

                        nameInput?.focus();
                        nameInput?.select();
                        return false;
                    }

                    settings.screenName = draft.screenName.trim();
                    settings.awayMessage = draft.awayMessage;
                    settings.userStatus = draft.userStatus;
                    settings.soundEnabled = draft.soundEnabled;

                    desktop.soundEnabled = settings.soundEnabled;

                    dirty = false;
                    applyButton.disabled = true;
                    applyButton.style.opacity = "0.55";

                    renderBuddies();
                    updateChatScreenNames();

                    return true;
                }

                function closeSetup() {
                    setupWindow?.close();
                }

                okButton.addEventListener("click", () => {
                    if (commit()) closeSetup();
                });

                cancelButton.addEventListener("click", closeSetup);

                applyButton.addEventListener("click", commit);
                applyButton.disabled = true;
                applyButton.style.opacity = "0.55";

                buttons.append(okButton, cancelButton, applyButton);
                body.append(navigation, pagePanel);
                content.append(intro, body, buttons);

                setupWindow.content.append(content);

                // Closing with the window's X discards any unapplied changes.
                // Apply commits changes without closing the preferences window.
                renderPage();

                return setupWindow;
            }

            function openAddBuddy() {
                openInputDialog({
                    title: "Add Buddy",
                    label: "Enter the buddy's screen name:",
                    placeholder: "Screen name",
                    height: 175,

                    validate: name => {
                        if (!name) return false;

                        if (buddies.some(
                            buddy => buddy.name.toLowerCase() === name.toLowerCase()
                        )) {
                            return false;
                        }

                        return true;
                    },

                    onSubmit(name) {
                        if (!name) return;

                        const buddy = {
                            id: `custom-${crypto.randomUUID()}`,
                            name,
                            group: "Buddies",
                            status: "online",
                            profile: "A fellow AOL user. Say hello!",
                            systemPrompt:
                                `You are ${name}, a user on AOL Instant Messenger in 1998.`
                        };

                        buddies.push(buddy);
                        selectedBuddyId = buddy.id;

                        renderBuddies();
                    }
                });
            }

            function openAwayDialog() {
                openInputDialog({
                    title: "Away Message",
                    label: "Your away message:",
                    value: settings.awayMessage,
                    multiline: true,
                    height: 200,

                    onSubmit(message) {
                        settings.awayMessage = message ||
                            "I'm away from my computer right now. BRB!";

                        setStatus("away");
                    }
                });
            }

            function openChat(buddyId) {
                const buddy = buddies.find(item => item.id === buddyId);
                if (!buddy) return;

                if (chats.has(buddyId)) {
                    chats.get(buddyId).focus();
                    return;
                }

                const chat = desktop.createWindow({
                    title: `${buddy.name} - Instant Message`,
                    icon: "💬",
                    width: 390,
                    height: 365,
                    minWidth: 285,
                    minHeight: 300,
                    onClose: () => {
                        chats.delete(buddyId);
                    }
                });

                chats.set(buddyId, chat);

                const view = document.createElement("div");
                view.className = "chat-app";

                view.innerHTML = `
                    <div class="app-menu-bar">
                        <button>File</button>
                        <button data-action="setup">Edit</button>
                        <button>People</button>
                        <button>Help</button>
                    </div>

                    <div class="chat-meta">
                        <span class="chat-screen-name"></span> talking to:
                        <strong></strong>
                    </div>

                    <div class="chat-log inset">
                        <div style="color:#888;text-align:center;font-size:11px;margin-bottom:10px">
                            — Direct IM session connected —
                        </div>
                    </div>

                    <form class="chat-compose">
                        <textarea aria-label="Message" placeholder="Type a message..."></textarea>
                        <div class="chat-compose-actions">
                            <button type="button" class="system-button" data-action="profile">
                                Profile
                            </button>
                            <button class="system-button" type="submit">Send</button>
                        </div>
                    </form>
                `;

                view.querySelector(".chat-screen-name").textContent = settings.screenName;
                view.querySelector(".chat-meta strong").textContent = buddy.name;

                const log = view.querySelector(".chat-log");
                const input = view.querySelector("textarea");

                const conversationMessages = [
                    {
                        role: "system",
                        content: buddy.systemPrompt ||
                            `You are ${buddy.name}, a user on AOL Instant Messenger in 1998.`
                    }
                ];

                function append(sender, message, system = false) {
                    const line = document.createElement("div");
                    line.className = "chat-line";

                    const strong = document.createElement("strong");
                    strong.textContent = `${sender}: `;

                    const body = document.createElement("span");
                    body.textContent = message;

                    if (system) strong.style.color = "#666";

                    line.append(strong, body);
                    log.append(line);
                    log.scrollTop = log.scrollHeight;
                }

                view.querySelector('[data-action="profile"]').addEventListener("click", () => {
                    showInfo(buddy);
                });

                view.querySelector("form").addEventListener("submit", async event => {
                    event.preventDefault();

                    const message = input.value.trim();
                    if (!message) return;

                    append(settings.screenName, message);
                    input.value = "";

                    if (buddy.status === "offline") {
                        setTimeout(() => {
                            append(
                                "System",
                                `${buddy.name} is offline and cannot receive your message.`,
                                true
                            );
                        }, 450);

                        return;
                    }

                    if (buddy.status === "away") {
                        setTimeout(() => {
                            append(buddy.name, `AUTO-REPLY: ${settings.awayMessage}`);
                        }, 500);

                        return;
                    }

                    conversationMessages.push({ role: "user", content: message });

                    const typingLine = document.createElement("div");
                    typingLine.className = "chat-line";

                    const typingLabel = document.createElement("strong");
                    typingLabel.style.color = "#888";
                    typingLabel.textContent = `${buddy.name}: `;

                    const typingText = document.createElement("span");
                    typingText.style.color = "#888";
                    typingText.style.fontStyle = "italic";
                    typingText.textContent = "typing...";

                    typingLine.append(typingLabel, typingText);
                    log.append(typingLine);
                    log.scrollTop = log.scrollHeight;

                    try {
                        const engine = await getOrInitEngine(progress => {
                            typingText.textContent =
                                `loading model... ${Math.round(progress.progress * 100)}%`;
                        });

                        const replyStream = await engine.chat.completions.create({
                            messages: conversationMessages,
                            stream: true,
                            max_tokens: 48,
                            temperature: 0.8,
                            top_p: 0.9
                        });

                        typingLine.remove();

                        const replyLine = document.createElement("div");
                        replyLine.className = "chat-line";

                        const strong = document.createElement("strong");
                        strong.textContent = `${buddy.name}: `;

                        const body = document.createElement("span");

                        replyLine.append(strong, body);
                        log.append(replyLine);

                        let fullReply = "";

                        for await (const chunk of replyStream) {
                            fullReply += chunk.choices[0]?.delta?.content || "";
                            body.textContent = fullReply;
                            log.scrollTop = log.scrollHeight;
                        }

                        fullReply = fullReply.trim();

                        if (!fullReply) {
                            replyLine.remove();
                            append("System", "No response was generated. Try again.", true);
                            conversationMessages.pop();
                            return;
                        }

                        body.textContent = fullReply;

                        conversationMessages.push({
                            role: "assistant",
                            content: fullReply
                        });
                    } catch (error) {
                        typingLine.remove();

                        append("System", `Error generating response: ${error.message}`, true);

                        const lastMessage = conversationMessages.at(-1);

                        if (
                            lastMessage?.role === "user" &&
                            lastMessage.content === message
                        ) {
                            conversationMessages.pop();
                        }
                    }
                });

                chat.content.append(view);
                input.focus();
            }

            function showInfo(buddy) {
                openClassicDialog({
                    title: `${buddy.name}'s Profile`,
                    width: 300,
                    height: 240,

                    build({ content, close }) {
                        const panel = createInsetPanel();

                        const heading = document.createElement("strong");
                        heading.textContent = buddy.name;

                        const status = document.createElement("p");
                        status.textContent = `Status: ${buddy.status.toUpperCase()}`;

                        const profile = document.createElement("p");
                        profile.textContent = buddy.profile;

                        const buttons = document.createElement("div");
                        buttons.style.cssText =
                            "display:flex;justify-content:flex-end;margin-top:auto;";

                        const closeButton = createClassicButton("Close");
                        closeButton.addEventListener("click", close);

                        panel.append(heading, status, profile);
                        buttons.append(closeButton);
                        content.append(panel, buttons);
                    }
                });
            }

            function showAbout() {
                openClassicDialog({
                    title: "About AOL Instant Messenger",
                    width: 300,
                    height: 225,

                    build({ content, close }) {
                        setClassicStyle(content, {
                            alignItems: "center",
                            textAlign: "center",
                            justifyContent: "center"
                        });

                        const logo = document.createElement("div");
                        logo.className = "aim-logo";
                        logo.textContent = "AIM";

                        const title = document.createElement("strong");
                        title.textContent = "America Online Instant Messenger";

                        const edition = document.createElement("p");
                        edition.textContent = "Portfolio Edition · inspired by classic AIM";

                        const note = document.createElement("p");
                        note.textContent = "Built with HTML, CSS, and JavaScript";

                        const closeButton = createClassicButton("OK");
                        closeButton.addEventListener("click", close);

                        content.append(logo, title, edition, note, closeButton);
                    }
                });
            }

            root.addEventListener("click", event => {
                const action = event.target.closest("[data-action]")?.dataset.action;

                if (action === "im") {
                    if (selectedBuddyId) {
                        openChat(selectedBuddyId);
                    } else {
                        showInfoMessage("Select a buddy first.");
                    }
                }

                if (action === "info") {
                    const buddy = buddies.find(item => item.id === selectedBuddyId);

                    if (buddy) {
                        showInfo(buddy);
                    } else {
                        showInfoMessage("Select a buddy first.");
                    }
                }

                if (action === "add") openAddBuddy();
                if (action === "away") openAwayDialog();
                if (action === "setup") showSetup();
                if (action === "about") showAbout();

                if (action === "online") {
                    setStatus("online");
                }

                if (action === "sound") {
                    settings.soundEnabled = !settings.soundEnabled;
                    desktop.soundEnabled = settings.soundEnabled;
                    renderBuddies();
                }

                if (action === "chat") {
                    showInfoMessage("Chat rooms are a planned extension.");
                }
            });

            function showInfoMessage(message) {
                openClassicDialog({
                    title: "AOL Instant Messenger",
                    width: 300,
                    height: 150,

                    build({ content, close }) {
                        const text = document.createElement("p");
                        text.textContent = message;

                        const buttons = document.createElement("div");
                        buttons.style.cssText =
                            "display:flex;justify-content:flex-end;margin-top:auto;";

                        const ok = createClassicButton("OK", { primary: true });
                        ok.addEventListener("click", close);

                        buttons.append(ok);
                        content.append(text, buttons);
                    }
                });
            }

            root.querySelector(".status-select").addEventListener("change", event => {
                const status = event.target.value;

                if (status === "away") {
                    openAwayDialog();
                } else {
                    setStatus("online");
                }
            });

            win.content.append(root);
            renderBuddies();

            return win;
        }
    };
}
