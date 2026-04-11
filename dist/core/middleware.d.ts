import type { Middleware, OpenFetchContext } from "../types/index.js";
export type { Middleware };
export declare function applyMiddlewares(ctx: OpenFetchContext, next: () => Promise<void>): Promise<void>;
//# sourceMappingURL=middleware.d.ts.map