
let pyodidePromise;
let executionQueue = Promise.resolve();

function getPyodide() {
    if (!pyodidePromise) {
        pyodidePromise = import(
            "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs"
        ).then(({ loadPyodide }) => loadPyodide());
    }

    return pyodidePromise;
}

export function runPython(
    source,
    onOutput = () => { },
    filename = "<string>",
    args = []
) {
    const task = executionQueue.then(async () => {
        const pyodide = await getPyodide();

        pyodide.setStdout({
            batched: text => onOutput(text)
        });

        pyodide.setStderr({
            batched: text => onOutput(text)
        });

        try {
            pyodide.globals.set("__name__", "__main__");
            pyodide.globals.set("__file__", filename);
            pyodide.globals.set("__argv__", [filename, ...args]);


            await pyodide.runPythonAsync(`
import sys

sys.argv = list(__argv__)

try:
    exec(
        compile(
            ${JSON.stringify(source)},
            __file__,
            "exec"
        ),
        globals()
    )
except SystemExit as exc:
    if exc.code not in (None, 0):
        print(f"Process exited with code {exc.code}", file=sys.stderr)
`);


        } catch (error) {
            onOutput(String(error));
        } finally {
            pyodide.globals.delete("__argv__");
        }
    });

    executionQueue = task.catch(() => { });
    return task;
}
