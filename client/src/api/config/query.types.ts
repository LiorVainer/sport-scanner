type ServiceMethodArguments<T> = T extends (...args: infer A) => any ? A : never;
export type ServiceMethodReturn<T> = T extends (...args: any[]) => infer R ? R : never;

export type QueryConfig<TService> = {
    [K in keyof TService]: TService[K] extends (...args: any[]) => any
        ? {
              key: K;
              args: ServiceMethodArguments<TService[K]>;
              returnType: Awaited<ServiceMethodReturn<TService[K]>>;
          }
        : never;
};

export type GetByQuery<T, TPopulate = false> = Partial<T> & { step?: number; limit?: number; populate?: TPopulate };
