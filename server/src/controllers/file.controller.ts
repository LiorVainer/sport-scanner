import fs from 'fs';
import path from 'node:path';
import { Request, Response } from 'express';

export const fileController = {
    handleUpload(req: Request, res: Response) {
        const url = req.file?.path.replace(/\\/g, '/');
        if (req.file) {
            res.status(200).send({ url });
        } else {
            res.status(400).send({ error: 'File upload failed' });
        }
    },
    deleteFile(req: Request, res: Response) {
        const { url } = req.params;
        if (!url) {
            res.status(400).send({ error: 'File URL is required' });
            return;
        }
        const filePath = path.join(__dirname, '../../public', url);

        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).send({ error: 'Failed to delete file', details: err.message });
            }
            res.status(200).send({ message: 'File deleted successfully' });
        });
    },
};
