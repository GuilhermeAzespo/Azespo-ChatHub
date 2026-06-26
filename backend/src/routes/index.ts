import { Router } from 'express';
import { createInstance, fetchInstances, deleteInstance, getQrCode, connectionState } from '../controllers/instance.controller';
import { sendText } from '../controllers/message.controller';
import { getContacts, getMessages } from '../controllers/chat.controller';

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

// Chat Routes
router.get('/chat/contacts/:instanceName', getContacts);
router.get('/chat/messages/:instanceName/:remoteJid', getMessages);

export default router;
