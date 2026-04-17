import type { Middleware, OpenFetchContext } from "../domain/types.js";
export type { Middleware };
export declare function applyMiddlewares(ctx: OpenFetchContext, next: () => Promise<void>): Promise<void>;
//# sourceMappingURL=middleware.d.ts.map