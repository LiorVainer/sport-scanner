import {createContext, useContext, useState} from 'react';
import {Package, PackageGenerateParams} from '@/models/packages/package.model.ts';
import {UseMutateFunction, useMutation} from '@tanstack/react-query';
import {PackageService} from '@api/services/package.service';
import {PackagesGenerationProgressUpdate} from '@/models/packages/package-generation-progress-update.model.ts';
import {GeneratePackagesSteps} from "@/models/packages/packages-generate-steps.model.ts";

interface PackagesContextType {
    packages: Package[] | undefined;
    isLoading: boolean;
    progressSteps: PackagesGenerationProgressUpdate[];
    fetchPackages: UseMutateFunction<Package[], Error, PackageGenerateParams>;
    hideProgressSteps: boolean;
    setHideProgressSteps: (hide: boolean) => void;
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined);

const HIDE_PROGRESS_STEPS_TIMEOUT = 1500;

export const PackagesProvider = ({children}: { children: React.ReactNode }) => {
    const [progressSteps, setProgressSteps] = useState<PackagesGenerationProgressUpdate[]>([]);
    const [hideProgressSteps, setHideProgressSteps] = useState(false);


    const {mutate: generatePackages, isPending, data: packages} = useMutation({
        mutationFn: (params: PackageGenerateParams) =>
            PackageService.getPackages(params, (newProgressStep) => {
                setProgressSteps((prev) => [...prev, newProgressStep])

                if (newProgressStep.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES) {
                    setHideProgressSteps(true);
                }
            }),
    });

    const fetchPackages = async (params: PackageGenerateParams) => {
        setHideProgressSteps(false);
        setProgressSteps([]);
        generatePackages(params);
    }

    return (
        <PackagesContext.Provider
            value={{
                packages,
                isLoading: isPending,
                progressSteps,
                fetchPackages,
                hideProgressSteps,
                setHideProgressSteps
            }}>
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
