import {
    DefinedInitialDataOptions,
    UndefinedInitialDataOptions,
    UseMutationOptions,
    UseQueryOptions,
} from '@tanstack/react-query';
import { QueryConfig } from '@api/config/query.types.ts';

export type UseQueryOptionsUnion<TQueryFnData> =
    | UseQueryOptions<TQueryFnData>
    | DefinedInitialDataOptions<TQueryFnData>
    | UndefinedInitialDataOptions<TQueryFnData>;

export type UseServiceConfig<TService, TMethod extends keyof QueryConfig<TService>> = {
    service: TService;
    method: TMethod;
};

export type UseQueryServiceConfig<TService, TMethod extends keyof QueryConfig<TService>> = UseServiceConfig<
    TService,
    TMethod
> & {
    options?: Omit<UseQueryOptionsUnion<QueryConfig<TService>[TMethod]['returnType']>, 'queryFn' | 'queryKey'>;
};

export type UseMutationServiceConfig<TService, TMethod extends keyof QueryConfig<TService>> = UseServiceConfig<
    TService,
    TMethod
> & {
    options?: Omit<
        UseMutationOptions<QueryConfig<TService>[TMethod]['returnType'], unknown, Error>,
        'mutationFn' | 'mutationKey'
    >;
};
