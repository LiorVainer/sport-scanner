import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middlware';
import { ENV } from '../env/env.config';
import { historyController } from '../controllers/history.controller';

const router = Router();

ENV.NODE_ENV === 'production' && router.use(authMiddleware);


router.get('/', historyController.getUsersHistory);

router.post('/', historyController.addToUsersHistory);

export default router;
