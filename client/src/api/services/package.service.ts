import { axiosInstance, SERVER_URL } from '../config/axios-instance';
import { Package, PackageDocument } from '@/models/packages/package.model.ts';
import {
    PackagesGenerationProgressUpdate,
    PackagesGenerationProgressUpdateSchema,
} from '@/models/packages/package-generation-progress-update.model.ts';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';
import { PackagesGenerationParams } from '@/models/packages/package-generate-params.model.ts';

export const ROUTE_PREFIX = '/packages';

export const PackageService = {
    getPackages: async function (
        params: PackagesGenerationParams,
        onProgress?: (progress: PackagesGenerationProgressUpdate) => void
    ): Promise<Package[]> {
        if (!onProgress) {
            const { data } = await axiosInstance.post<Package[]>(`${ROUTE_PREFIX}/generate`, params);
            return data;
        }

        return new Promise<Package[]>((resolve, reject) => {
            const controller = new AbortController();

            fetchEventSource(`${SERVER_URL}${ROUTE_PREFIX}/generate/stream`, {
                method: 'POST',
                body: JSON.stringify(params),
                headers: {
                    Accept: 'text/event-stream',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                signal: controller.signal,
                async onopen(response) {
                    if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
                    } else {
                        controller.abort();
                        reject(new Error(`Unexpected response: ${response.status}`));
                    }
                },
                onmessage(event) {
                    const data: unknown = JSON.parse(event.data);
                    const validated = PackagesGenerationProgressUpdateSchema.parse(data);

                    if (validated.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES) {
                        onProgress(validated);
                        controller.abort();
                        resolve(validated.packages);
                    } else {
                        onProgress?.(validated);
                    }
                },
                onerror(err) {
                    controller.abort();
                    reject(err);
                },
                openWhenHidden: false,
            });
        });
    },

    async getById(packageId: string) {
        try {
            const { data } = await axiosInstance.get<PackageDocument>(`${ROUTE_PREFIX}/${packageId}`);
            return data;
        } catch (error) {
            console.error('Error getting package by id:', (error as any).message);
            throw error;
        }
    },

    async create(newPackage: Package) {
        try {
            const { data } = await axiosInstance.post<PackageDocument>(`${ROUTE_PREFIX}/`, newPackage);
            return data;
        } catch (error) {
            console.error('Error creating package:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
