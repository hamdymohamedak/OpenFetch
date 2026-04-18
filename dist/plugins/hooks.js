/**
 * Lifecycle hooks as a single middleware. For transforming config/response, prefer interceptors.
 */
export function hooks(options) {
    const { onRequest, onResponse, onError, onBeforeRetry, onAfterResponse } = options;
    return async (ctx, next) => {
        if (onBeforeRetry != null || onAfterResponse != null) {
            const r = ctx.request.retry ?? {};
            const prevBefore = r.onBeforeRetry;
            const prevAfter = r.onAfterResponse;
            ctx.request.retry = {
                ...r,
                onBeforeRetry: prevBefore && onBeforeRetry
                    ? async (c, i) => {
                        await prevBefore(c, i);
                        await onBeforeRetry(c, i);
                    }
                    : onBeforeRetry ?? prevBefore,
                onAfterResponse: prevAfter && onAfterResponse
                    ? async (c, res) => {
                        await prevAfter(c, res);
                        await onAfterResponse(c, res);
                    }
                    : onAfterResponse ?? prevAfter,
            };
        }
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
