import {AsyncLocalStorage} from 'node:async_hooks';

type RequestContext = {
    requestId?: string;
    headers?: Record<string, any>;
    body?: Record<string, any>;
};

export const context = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
    return context.getStore() || {};
}

export function getRequestId(): string | undefined {
    return getRequestContext().requestId;
}