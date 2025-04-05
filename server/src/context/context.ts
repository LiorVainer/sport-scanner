import {AsyncLocalStorage} from 'node:async_hooks';
import {PublicUser} from '../models/user.model';

type RequestContext = {
    requestId?: string;
    headers?: Record<string, any>;
    body?: Record<string, any>;
    user?: PublicUser
};

export const context = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
    return context.getStore() || {};
}
