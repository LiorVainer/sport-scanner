import { createContext, useContext, useState } from 'react';
import { Package } from '@/models/package.model';

interface PackagesContextType {
    packages: Package[];
    setPackages: (packages: Package[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const PackagesContext = createContext<PackagesContextType | undefined>(undefined);

export const PackagesProvider = ({ children }: { children: React.ReactNode }) => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
        <PackagesContext.Provider value={{ packages, setPackages, isLoading, setIsLoading }}>
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
