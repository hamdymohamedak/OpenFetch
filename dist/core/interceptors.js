/**
 * Axios-compatible interceptor stacks: request runs last-registered first;
 * response runs first-registered first.
 */
export class InterceptorManager {
    handlers = [];
    use(fulfilled, rejected) {
        this.handlers.push({ fulfilled, rejected });
        return this.handlers.length - 1;
    }
    eject(id) {
        if (id >= 0 && id < this.handlers.length) {
            this.handlers[id] = {};
        }
    }
    clear() {
        this.handlers = [];
    }
    async runRequest(value) {
        let p = Promise.resolve(value);
        for (let i = this.handlers.length - 1; i >= 0; i--) {
            const h = this.handlers[i];
            if (!h.fulfilled && !h.rejected)
                continue;
            p = p.then(h.fulfilled ?? ((v) => v), h.rejected);
        }
        return p;
    }
    async runResponse(value) {
        let p = Promise.resolve(value);
        for (let i = 0; i < this.handlers.length; i++) {
            const h = this.handlers[i];
            if (!h.fulfilled && !h.rejected)
                continue;
            p = p.then(h.fulfilled ?? ((v) => v), h.rejected);
        }
        return p;
    }
}
