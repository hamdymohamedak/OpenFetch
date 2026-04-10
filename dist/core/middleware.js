export async function applyMiddlewares(ctx, next) {
    const stack = ctx.request.middlewares ?? [];
    async function run(i) {
        const fn = (stack[i] ?? next);
        if (!fn)
            return;
        try {
            await fn(ctx, () => run(i + 1));
        }
        catch (err) {
            ctx.error = err;
            throw err;
        }
    }
    await run(0);
}
