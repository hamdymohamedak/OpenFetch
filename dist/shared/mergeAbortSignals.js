export function mergeAbortSignals(userSignal, controller) {
    if (!userSignal)
        return controller.signal;
    if (typeof AbortSignal !== "undefined" && "any" in AbortSignal) {
        return AbortSignal.any([userSignal, controller.signal]);
    }
    const combined = new AbortController();
    const onAbort = () => combined.abort();
    if (userSignal.aborted) {
        combined.abort();
        return combined.signal;
    }
    userSignal.addEventListener("abort", onAbort, { once: true });
    controller.signal.addEventListener("abort", onAbort, { once: true });
    return combined.signal;
}
