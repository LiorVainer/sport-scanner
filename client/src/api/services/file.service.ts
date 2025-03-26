import { axiosInstance } from '../config/axios-instance';

export const ROUTE_PREFIX = '/file';

export const FileService = {
    async handleUpload(formData: FormData) {
        try {
            return axiosInstance.post(ROUTE_PREFIX, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error uploading file:', (error as any).message);
            throw error;
        }
    },

    async deleteFile(url: string) {
        try {
            return axiosInstance.delete(`${ROUTE_PREFIX}/${url}`);
        } catch (error) {
            console.error('Error deleting file:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
