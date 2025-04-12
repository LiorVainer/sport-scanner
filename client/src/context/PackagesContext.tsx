import { createContext, useContext, useState } from 'react';
import { message } from 'antd';
import { Package } from '@/models/packages/package.model.ts';
import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import { PackageService } from '@api/services/package.service';
import { PackagesGenerationProgressUpdate } from '@/models/packages/package-generation-progress-update.model.ts';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';
import { useLocalStorage } from '@hooks/useLocalStorage.hooks.ts';
import { PackagesGenerationParams } from '@/models/packages/package-generate-params.model.ts';

interface PackagesContextType {
    packages: Package[] | undefined;
    isLoading: boolean;
    progressSteps: PackagesGenerationProgressUpdate[];
    fetchPackages: UseMutateFunction<Package[], Error, PackagesGenerationParams>;
    hideProgressSteps: boolean;
    setHideProgressSteps: (hide: boolean) => void;
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined);

export const PackagesProvider = ({ children }: { children: React.ReactNode }) => {
    const [progressSteps, setProgressSteps] = useState<PackagesGenerationProgressUpdate[]>([]);
    const [hideProgressSteps, setHideProgressSteps] = useState(false);
    const [packages, setPackages] = useLocalStorage<Package[] | undefined>('packages-results', undefined);

    const { mutate: generatePackages, isPending } = useMutation({
        mutationFn: (params: PackagesGenerationParams) =>
            PackageService.getPackages(params, (newProgressStep) => {
                setProgressSteps((prev) => [...prev, newProgressStep]);

                if (newProgressStep.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES) {
                    message.success(
                        `Generated ${newProgressStep.packages.length} packages for you in ${(newProgressStep.durationMs / 1000).toFixed(2)} seconds`
                    );
                    setHideProgressSteps(true);
                }
            }),
        onSuccess: (data) => {
            setPackages(data);
        },
    });

    const fetchPackages = async (params: PackagesGenerationParams) => {
        setHideProgressSteps(false);
        setProgressSteps([]);
        generatePackages(params);
    };

    return (
        <PackagesContext.Provider
            value={{
                packages,
                isLoading: isPending,
                progressSteps,
                fetchPackages,
                hideProgressSteps,
                setHideProgressSteps,
            }}
        >
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
