import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendText = async (req: Request, res: Response) => {
    try {
        let { instanceName } = req.params;
        instanceName = instanceName.trim();
        const { number, text } = req.body;

        if (!number || !text) {
            return res.status(400).json({ error: 'Parâmetros "number" e "text" são obrigatórios' });
        }

        const session: any = (whatsappService as any).sessions.get(instanceName);

        if (!session || !session.sock || session.status !== 'open') {
            return res.status(400).json({ error: 'Instância não conectada ou inexistente' });
        }

        const formattedNumber = number.includes('@s.whatsapp.net') ? number : `${number}@s.whatsapp.net`;

        // Envia mensagem simulando digitação
        await session.sock.presenceSubscribe(formattedNumber);
        await session.sock.sendPresenceUpdate('composing', formattedNumber);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay fake de 1 seg
        
        await session.sock.sendPresenceUpdate('paused', formattedNumber);
        const result = await session.sock.sendMessage(formattedNumber, { text });

        res.json({ status: 'SUCCESS', message: 'Mensagem enviada', data: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
