import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { QueryConfig } from '../config/query.types.ts';
import { UseMutationServiceConfig, UseQueryServiceConfig } from '@api/hooks/service-hooks.types.ts';

/**
 * A generic React Query hook to execute service methods with type safety.
 *
 * This hook dynamically resolves a method from the given service object
 * and executes it with the provided arguments, leveraging React Query for caching
 * and state management.
 *
 * @template TService - The type of the service object containing the methods.
 * @template TMethod - The key of the method in the service to be called.
 *
 * @param {Object} config - Configuration object for the hook.
 * @param {TService} config.service - The service object containing the methods.
 * @param {TMethod} config.method - The method name (key) in the service to execute.
 * @param {Object} [config.options] - React Query's `useQuery` hook configuration options.
 * @param {...QueryConfig<TService>[TMethod]['args']} args - The arguments to pass to the selected service method.
 *
 * @returns {UseQueryResult<QueryConfig<TService>[TMethod]['returnType'], Error>}
 * React Query result object containing the method's return value or error.
 *
 * @example
 * // Usage with UsersService
 * import { UsersService } from '../services/users.service';
 * import { useQueryService } from '../hooks/useQueryService';
 *
 * // Get all users
 * const { data, error, isPending } = useQueryService({ service: UsersService, method: 'getUsers' });
 *
 * // Get a user by ID
 * const { data, error, isPending } = useQueryService(
 *   { service: UsersService, method: 'getUserById' },
 *   'user-id-123'
 * );
 *
 * // Create a user
 * const { data, error, isPending } = useQueryService(
 *   { service: UsersService, method: 'createUser' },
 *   { name: 'John Doe', email: 'john@example.com' }
 * );
 *
 * // Update a user
 * const { data, error, isPending } = useQueryService(
 *   { service: UsersService, method: 'updateUser' },
 *   'user-id-123',
 *   { name: 'John Updated' }
 * );
 *
 * // Delete a user
 * const { data, error, isPending } = useQueryService(
 *   { service: UsersService, method: 'deleteUser' },
 *   'user-id-123'
 * );
 */
export const useQueryService = <TService, TMethod extends keyof QueryConfig<TService>>(
    { service, method, options }: UseQueryServiceConfig<TService, TMethod>,
    ...args: QueryConfig<TService>[TMethod]['args']
): UseQueryResult<QueryConfig<TService>[TMethod]['returnType'], Error> => {
    const queryFn = async (): Promise<QueryConfig<TService>[TMethod]['returnType']> => {
        const serviceMethod = service[method] as (
            ...args: QueryConfig<TService>[TMethod]['args']
        ) => Promise<QueryConfig<TService>[TMethod]['returnType']>;
        return await serviceMethod(...args);
    };

    return useQuery<QueryConfig<TService>[TMethod]['returnType'], Error>({
        queryKey: [method, ...args], // Include method name and arguments for caching
        queryFn,
        ...options,
    });
};

/**
 * A generic React Query hook to execute service mutations with type safety.
 *
 * This hook dynamically resolves a method from the given service object
 * and executes it with the provided arguments, leveraging React Query for caching
 * and state management.
 *
 * @template TService - The type of the service object containing the methods.
 * @template TMethod - The key of the method in the service to be called.
 *
 * @param {Object} config - Configuration object for the hook.
 * @param {TService} config.service - The service object containing the methods.
 * @param {TMethod} config.method - The method name (key) in the service to execute.
 * @param {Object} [config.options] - React Query's `useMutation` hook configuration options.
 * @param {...QueryConfig<TService>[TMethod]['args']} args - The arguments to pass to the selected service method.
 *
 * @returns {UseMutationResult<QueryConfig<TService>[TMethod]['returnType'], void, Error>}
 * React Mutation result object containing the method's return value or error.
 *
 * @example
 * // Usage with UsersService
 * import { UsersService } from '../services/users.service';
 * import { useMutationService } from '../hooks/useMutationService';
 *
 * // Create a new user
 * const { data, error, isLoading } = useMutationService(
 *   { service: UsersService, method: 'createUser' },
 *   { name: 'John Doe', email: 'john@example.com' }
 * );
 *
 * // Update a user
 * const { data, error, isLoading } = useMutationService(
 *   { service: UsersService, method: 'updateUser' },
 *   'user-id-123',
 *   { name: 'John Updated' }
 * );
 *
 * // Delete a user
 * const { data, error, isLoading } = useMutationService(
 *   { service: UsersService, method: 'deleteUser' },
 *   'user-id-123'
 * );
 */
export const useMutationService = <TService, TMethod extends keyof QueryConfig<TService>>(
    { service, method, options }: UseMutationServiceConfig<TService, TMethod>,
    ...args: QueryConfig<TService>[TMethod]['args']
): UseMutationResult<QueryConfig<TService>[TMethod]['returnType'], void, Error> => {
    const mutationFn = async (): Promise<QueryConfig<TService>[TMethod]['returnType']> => {
        const serviceMethod = service[method] as (
            ...args: QueryConfig<TService>[TMethod]['args']
        ) => Promise<QueryConfig<TService>[TMethod]['returnType']>;
        return await serviceMethod(...args);
    };

    return useMutation<QueryConfig<TService>[TMethod]['returnType'], void, Error>({
        mutationKey: [method, ...args], // Include method name and arguments for caching
        mutationFn,
        ...options,
    });
};

export const useQueryOnDefinedParam = <T, P>(key: string, param: P | undefined, fetchFn: (param: P) => Promise<T>) =>
    useQuery({
        queryKey: [key, param],
        queryFn: async () => (param !== undefined ? fetchFn(param) : Promise.resolve([] as T)),
        enabled: param !== undefined,
    });
