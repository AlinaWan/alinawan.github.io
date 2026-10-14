export function createProjectApp() {
    return {
        id: "projects", title: "My Projects", icon: "📁",
        open({ desktop }) {
            const win = desktop.createWindow({ title: "My Projects", icon: "📁", width: 500, height: 360, minWidth: 300, minHeight: 240 });
            const root = document.createElement("div");
            root.style.cssText = "padding:10px;overflow:auto;height:100%;";
            root.innerHTML = `<h2 style="font-size:14px;margin:0 0 8px">My Projects</h2><p style="margin:0 0 12px">A few things I've been building. Select a project to explore its website.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px" class="project-cards"></div>`;

            // Map projects to their respective website URLs
            const projects = [
                { name: "Livia", icon: "🧩", description: "C# automation library for Windows applications.", url: "http://livia.alinawan.com/" },
                { name: "Hazel", icon: "⌨️", description: "A programming language and compiler.", url: "http://hazel.alinawan.com/" },
                { name: "you", icon: "💬", description: "An interactive project about memories and things left unsaid.", url: "http://you.alinawan.com/" },
            ];

            const cards = root.querySelector(".project-cards");
            projects.forEach(project => {
                const card = document.createElement("button");
                card.className = "system-button";
                card.style.cssText = "min-height:105px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;text-align:left;padding:10px;";

                const title = document.createElement("strong");
                title.textContent = `${project.icon} ${project.name}`;

                const description = document.createElement("span");
                description.textContent = project.description;

                card.append(title, description);

                // Open Internet Explorer with the project's URL passed in options
                card.addEventListener("click", () => {
                    desktop.openApp("internet-explorer", { url: project.url });
                });

                cards.append(card);
            });

            win.content.append(root);
            return win;
        }
    };
}