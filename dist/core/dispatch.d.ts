import type { OpenFetchConfig, OpenFetchResponse } from "../types/index.js";
export type DispatchConfig = OpenFetchConfig & {
    url: string | URL;
};
export declare function dispatch(config: DispatchConfig): Promise<OpenFetchResponse>;
//# sourceMappingURL=dispatch.d.ts.map