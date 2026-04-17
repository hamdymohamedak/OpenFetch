import type { Middleware, OpenFetchContext } from "../domain/types.js";

export type { Middleware };

export async function applyMiddlewares(
  ctx: OpenFetchContext,
  next: () => Promise<void>
): Promise<void> {
  const stack = ctx.request.middlewares ?? [];

  async function run(i: number): Promise<void> {
    const fn = (stack[i] ?? next) as Middleware | (() => Promise<void>);
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
