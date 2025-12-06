import { Router } from 'express';

import {
    getRestrictedPermissions,
    postRestrictedPermission,
    deleteRestrictedPermission,
} from '../controllers/conversationPermissionsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:conversationId/permissions', getRestrictedPermissions);

router.post('/:conversationId/permissions', postRestrictedPermission);

router.delete('/:conversationId/permissions/:permissionId', deleteRestrictedPermission);

export default router;