import { createContext, useContext, useState } from 'react';
import { message } from 'antd';
import { Package } from '@/models/packages/package.model.ts';
import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import { PackageService } from '@api/services/package.service';
import { PackagesGenerationProgressUpdate } from '@/models/packages/package-generation-progress-update.model.ts';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';
import { useLocalStorage } from '@hooks/useLocalStorage.hooks.ts';
import { PackagesGenerationFormValues, PackagesGenerationParamsWithFreeText } from '@/models/packages/package-generate-params.model.ts';

interface PackagesContextType {
    packages: Package[] | undefined;
    isLoading: boolean;
    progressUpdates: PackagesGenerationProgressUpdate[];
    fetchPackages: UseMutateFunction<Package[], Error, PackagesGenerationParamsWithFreeText>;
    hideProgressTimeline: boolean;
    setHideProgressTimeline: (hide: boolean) => void;
    parseTextIntoParams: (text: string) => Promise<PackagesGenerationFormValues>;
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined);

export const PackagesProvider = ({ children }: { children: React.ReactNode }) => {
    const [progressUpdates, setProgressUpdates] = useLocalStorage<PackagesGenerationProgressUpdate[]>(
        'packages-generation-progress-updates',
        []
    );
    const [hideProgressTimeline, setHideProgressTimeline] = useState(false);
    const [packages, setPackages] = useLocalStorage<Package[] | undefined>('packages-generated', undefined);

    const { mutate: generatePackages, isPending } = useMutation({
        mutationFn: (params: PackagesGenerationParamsWithFreeText) =>
            PackageService.getPackages(params, (newProgressStep) => {
                setProgressUpdates((prev) => [...prev, newProgressStep]);

                if (newProgressStep.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES) {
                    message.success(
                        `Generated ${newProgressStep.packages.length} packages for you in ${(newProgressStep.durationMs / 1000).toFixed(2)} seconds`
                    );
                    setHideProgressTimeline(true);
                    console.log('Generated packages:', newProgressStep.packages);
                    setPackages(newProgressStep.packages);
                }
            }),
        retry: false,
    });

    const { mutateAsync: parseTextIntoParams } = useMutation({
        mutationFn: (text: string) => PackageService.parseTextIntoParams(text),
        retry: false,
    });

    const fetchPackages = async (params: PackagesGenerationParamsWithFreeText) => {
        setHideProgressTimeline(false);
        setProgressUpdates([]);
        generatePackages(params);
    };

    return (
        <PackagesContext.Provider
            value={{
                packages,
                isLoading: isPending,
                progressUpdates,
                fetchPackages,
                hideProgressTimeline,
                setHideProgressTimeline,
                parseTextIntoParams,
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
