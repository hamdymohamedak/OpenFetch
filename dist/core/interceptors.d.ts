export type InterceptorHandler<V> = {
    fulfilled?: (value: V) => V | Promise<V>;
    rejected?: (error: unknown) => unknown;
};
/**
 * Axios-compatible interceptor stacks: request runs last-registered first;
 * response runs first-registered first.
 */
export declare class InterceptorManager<V> {
    private handlers;
    use(fulfilled?: (value: V) => V | Promise<V>, rejected?: (error: unknown) => unknown): number;
    eject(id: number): void;
    clear(): void;
    runRequest(value: V): Promise<V>;
    runResponse(value: V): Promise<V>;
}
//# sourceMappingURL=interceptors.d.ts.map