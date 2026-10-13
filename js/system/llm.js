
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL_ID = "Phi-3.5-mini-instruct-q4f16_1-MLC";

let globalEngine = null;
let engineLoadingPromise = null;

/**
 * Gets the shared WebLLM engine, initializing it if necessary.
 *
 * @param {Function} [initProgressCallback] Receives model initialization progress.
 * @returns {Promise<import("@mlc-ai/web-llm").MLCEngine>}
 */
export async function getOrInitEngine(initProgressCallback) {
    if (globalEngine) return globalEngine;
    if (engineLoadingPromise) return engineLoadingPromise;

    engineLoadingPromise = CreateMLCEngine(MODEL_ID, {
        initProgressCallback
    })
        .then(engine => {
            globalEngine = engine;
            return engine;
        })
        .catch(error => {
            // Allow a later attempt if initialization failed.
            engineLoadingPromise = null;
            throw error;
        });

    return engineLoadingPromise;
}
