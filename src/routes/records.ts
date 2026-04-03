import { Router } from 'express';
import { RecordController } from '../controllers/recordController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

router.post('/', authorize('CREATE'), RecordController.create);
router.get('/summary', authorize('READ'), RecordController.summary);
router.get('/', authorize('READ'), RecordController.getAll);
router.put('/:id', authorize('UPDATE'), RecordController.update);
router.delete('/:id', authorize('DELETE'), RecordController.delete);

export default router;