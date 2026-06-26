import { Router } from 'express';
import { createInstance, fetchInstances, deleteInstance, getQrCode, connectionState } from '../controllers/instance.controller';
import { sendText } from '../controllers/message.controller';

import { createGlobalApiKey, listGlobalApiKeys, deleteGlobalApiKey } from '../controllers/auth.controller';

const router = Router();

// Auth Routes
router.post('/auth/apikey/create', createGlobalApiKey);
router.get('/auth/apikey/list', listGlobalApiKeys);
router.delete('/auth/apikey/delete/:id', deleteGlobalApiKey);

// Instance Routes
router.post('/instance/create', createInstance);
router.get('/instance/fetchInstances', fetchInstances);
router.get('/instance/connectionState/:instanceName', connectionState);
router.get('/instance/connect/:instanceName', getQrCode);
router.delete('/instance/delete/:instanceName', deleteInstance);

// Message Routes
router.post('/message/sendText/:instanceName', sendText);

export default router;
