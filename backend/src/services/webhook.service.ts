import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class WebhookService {
    async dispatch(instanceName: string, eventName: string, payload: any) {
        try {
            const instance = await prisma.instance.findUnique({ where: { name: instanceName } });
            
            if (instance && instance.webhookUrl) {
                await axios.post(instance.webhookUrl, {
                    event: eventName,
                    instance: instanceName,
                    data: payload
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });
                console.log(`[Webhook] Evento ${eventName} disparado para ${instance.webhookUrl}`);
            }
        } catch (error: any) {
            console.error(`[Webhook Erro] Falha ao disparar webhook para a instância ${instanceName}:`, error.message);
        }
    }
}

export const webhookService = new WebhookService();
