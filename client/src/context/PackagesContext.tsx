import {createContext, useContext} from 'react';
import {Package, PackageGenerateParams} from '@/models/package.model';
import {UseMutateFunction, useMutation} from "@tanstack/react-query";
import {PackageService} from "@api/services/package.service.ts";

interface PackagesContextType {
    packages: Package[] | undefined;
    isLoading: boolean;
    fetchPackages: UseMutateFunction<Package[], Error, PackageGenerateParams>
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined);

export const PackagesProvider = ({children}: { children: React.ReactNode }) => {

    const {mutate: fetchPackages, isPending, data: packages} = useMutation({
        mutationFn: (params: PackageGenerateParams) => PackageService.getPackages(params),
    });

    return (
        <PackagesContext.Provider value={{packages, isLoading: isPending, fetchPackages}}>
            {children}
        </PackagesContext.Provider>
    );
};

export const usePackages = () => {
    const context = useContext(PackagesContext);
    if (!context) {
        throw new Error('usePackages must be used within a PackagesProvider');
    }
    return context;
};
