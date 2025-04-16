import { getRequestContext } from '../context';
import winston from 'winston';

export const injectRequestContextFormat = winston.format((info) => {
    const context = getRequestContext() || {};
    info.meta = {
        ...(info.meta || {}),
        ...context,
    };
    return info;
});
