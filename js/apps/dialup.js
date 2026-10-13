
function createButton(label, onClick, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dialup-button${primary ? " primary" : ""}`;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function createLabel(text) {
    const label = document.createElement("div");
    label.className = "dialup-label";
    label.textContent = text;
    return label;
}

export function createDialUpApp() {
    return {
        id: "dialup",
        title: "Dial-Up Networking",
        icon: "assets/icons/dialup.svg",

        open({ desktop }) {
            let progressWindow = null;
            let timer = null;
            let cancelled = false;

            const welcomeWindow = desktop.createWindow({
                title: "Welcome to Dial-Up Networking",
                icon: "assets/icons/dialup.svg",
                width: 470,
                height: 300,
                minWidth: 470,
                minHeight: 300,
                resizable: false
            });

            const welcome = document.createElement("div");
            welcome.className = "dialup-wizard";

            const sidebar = document.createElement("div");
            sidebar.className = "dialup-wizard-sidebar";
            sidebar.innerHTML = `
                <div class="dialup-logo">
                    <img src="assets/icons/dialup.svg" alt="Dial-Up Modem">
                </div>
                <div class="dialup-logo-caption">Dial-Up<br>Networking</div>
            `;

            const main = document.createElement("div");
            main.className = "dialup-wizard-main";

            const heading = document.createElement("h2");
            heading.textContent = "Welcome to Dial-Up Networking";

            const message = document.createElement("p");
            message.textContent =
                "This wizard will help you connect to the Internet using your modem.";

            const details = document.createElement("p");
            details.textContent =
                "Click Next to dial your connection, or Cancel to close this wizard.";

            const spacer = document.createElement("div");
            spacer.className = "dialup-flex-spacer";

            const buttons = document.createElement("div");
            buttons.className = "dialup-button-row";
            buttons.append(
                createButton("Cancel", () => welcomeWindow.close()),
                createButton("Next >", () => {
                    welcomeWindow.close();
                    openProgress(desktop);
                }, true)
            );

            main.append(heading, message, details, spacer, buttons);
            welcome.append(sidebar, main);
            welcomeWindow.content.append(welcome);

            function openProgress(desktop) {
                if (cancelled) return;

                progressWindow = desktop.createWindow({
                    title: "Dialing Progress",
                    icon: "assets/icons/dialup.svg",
                    width: 380,
                    height: 225,
                    minWidth: 380,
                    minHeight: 225,
                    resizable: false,
                    onClose() {
                        cancelled = true;
                        if (timer !== null) {
                            clearTimeout(timer);
                            timer = null;
                        }
                    }
                });

                const panel = document.createElement("div");
                panel.className = "dialup-progress";

                const connection = document.createElement("div");
                connection.className = "dialup-connection";
                connection.innerHTML = `
                    <div class="dialup-modem-icon" aria-hidden="true">
                        <img src="assets/icons/dialup.svg" alt="Dial-Up Modem">
                    </div>
                    <div>
                        <div class="dialup-connection-title">Connecting to the Internet</div>
                        <div class="dialup-connection-name">My Connection</div>
                    </div>
                `;

                const fields = document.createElement("div");
                fields.className = "dialup-fields";

                const connectValue = document.createElement("div");
                connectValue.textContent = "My Connection";

                const actionValue = document.createElement("div");
                const statusValue = document.createElement("div");

                fields.append(
                    createLabel("Connect to:"),
                    connectValue,
                    createLabel("Action:"),
                    actionValue,
                    createLabel("Status:"),
                    statusValue
                );

                const progressTrack = document.createElement("div");
                progressTrack.className = "dialup-progress-track";
                progressTrack.setAttribute("aria-label", "Dialing progress");

                const progressFill = document.createElement("div");
                progressFill.className = "dialup-progress-fill";
                progressTrack.append(progressFill);

                const footer = document.createElement("div");
                footer.className = "dialup-progress-footer";

                const cancelButton = createButton("Cancel", () => {
                    progressWindow?.close();
                });

                footer.append(cancelButton);
                panel.append(connection, fields, progressTrack, footer);
                progressWindow.content.append(panel);

                let attempt = 1;

                function updateProgress() {
                    if (cancelled || !progressWindow) return;

                    actionValue.textContent = `Dialing attempt ${attempt} of 5`;
                    statusValue.textContent = "Dialing...";
                    progressFill.style.width = `${attempt * 12}%`;

                    if (attempt >= 3) {
                        timer = setTimeout(() => {
                            if (cancelled) return;

                            timer = null;
                            actionValue.textContent = "Connection established";
                            statusValue.textContent = "Connected";
                            progressFill.style.width = "100%";
                            progressFill.classList.add("complete");

                            const success = document.createElement("div");
                            success.className = "dialup-success";
                            success.textContent =
                                "You are now connected to My Connection.";

                            panel.insertBefore(success, progressTrack);
                            cancelButton.textContent = "Close";
                        }, 1300);

                        return;
                    }

                    timer = setTimeout(() => {
                        timer = null;
                        attempt++;
                        updateProgress();
                    }, 1500);
                }

                cancelButton.addEventListener("click", () => {
                    if (statusValue.textContent === "Connected") {
                        progressWindow?.close();
                    }
                });

                updateProgress();
            }
        }
    };
}
