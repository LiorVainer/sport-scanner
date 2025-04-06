import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middlware';
import { ENV } from '../env/env.config';
import { savedPackageController } from '../controllers/saved-package.controller';

const router = Router();

ENV.NODE_ENV === 'production' && router.use(authMiddleware);


router.get('/', savedPackageController.getUsersSavedPackages);

router.post('/', savedPackageController.addToUsersSavedPackages);

export default router;
