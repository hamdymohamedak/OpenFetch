import type { Middleware, OpenFetchContext } from "../types/index.js";

export type { Middleware };

export async function applyMiddlewares(
  ctx: OpenFetchContext,
  next: () => Promise<void>
): Promise<void> {
  const stack = ctx.request.middlewares ?? [];

  let index = -1;
  async function run(i: number): Promise<void> {
    if (i <= index) return;
    index = i;

    const fn: Middleware | undefined = stack[i] ?? next;
    if (!fn) return;

    try {
      await fn(ctx, () => run(i + 1));
    } catch (err) {
      ctx.error = err;
      throw err;
    }
  }

  await run(0);
}
