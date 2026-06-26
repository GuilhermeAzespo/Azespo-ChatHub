import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { whatsappService } from './services/whatsapp.service';

import router from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import path from 'path';

app.use('/api', router);

// Serve Static Frontend (React)
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Azespo-ChatHub' });
});

// Any other route falls back to React index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
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
