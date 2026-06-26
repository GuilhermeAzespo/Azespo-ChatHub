import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { whatsappService } from './services/whatsapp.service';

import router from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', router);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Azespo-ChatHub' });
});

// Inicializa o serviço do WhatsApp (reconecta instâncias existentes)
whatsappService.init().then(() => {
    console.log('WhatsApp Service initialized');
}).catch((error) => {
    console.error('Failed to initialize WhatsApp Service', error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Azespo-ChatHub Backend running on port ${PORT}`);
});
