export type InterceptorHandler<V> = {
  fulfilled?: (value: V) => V | Promise<V>;
  rejected?: (error: unknown) => unknown;
};

/**
 * Axios-compatible interceptor stacks: request runs last-registered first;
 * response runs first-registered first.
 */
export class InterceptorManager<V> {
  private handlers: InterceptorHandler<V>[] = [];

  use(
    fulfilled?: (value: V) => V | Promise<V>,
    rejected?: (error: unknown) => unknown
  ): number {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (id >= 0 && id < this.handlers.length) {
      this.handlers[id] = {};
    }
  }

  clear(): void {
    this.handlers = [];
  }

  async runRequest(value: V): Promise<V> {
    let p: Promise<V> = Promise.resolve(value);
    for (let i = this.handlers.length - 1; i >= 0; i--) {
      const h = this.handlers[i];
      if (!h.fulfilled && !h.rejected) continue;
      p = p.then(
        h.fulfilled ?? ((v: V) => v),
        h.rejected
      ) as Promise<V>;
    }
    return p;
  }

  async runResponse(value: V): Promise<V> {
    let p: Promise<V> = Promise.resolve(value);
    for (let i = 0; i < this.handlers.length; i++) {
      const h = this.handlers[i];
      if (!h.fulfilled && !h.rejected) continue;
      p = p.then(
        h.fulfilled ?? ((v: V) => v),
        h.rejected
      ) as Promise<V>;
    }
    return p;
  }
}
