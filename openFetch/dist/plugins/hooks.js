/**
 * Lifecycle hooks as a single middleware. For transforming config/response, prefer interceptors.
 */
export function hooks(options) {
    const { onRequest, onResponse, onError } = options;
    return async (ctx, next) => {
        if (onRequest)
            await onRequest(ctx);
        try {
            await next();
            if (onResponse && ctx.response != null)
                await onResponse(ctx);
        }
        catch (err) {
            if (onError)
                await onError(ctx, err);
            throw err;
        }
    };
}
