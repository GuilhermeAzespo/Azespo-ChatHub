import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createInstance = async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.body;
        if (!instanceName) return res.status(400).json({ error: 'instanceName é obrigatório' });

        const existingDb = await prisma.instance.findUnique({ where: { name: instanceName } });
        if (existingDb) return res.status(400).json({ error: 'Instância já existe no banco' });

        const dbInstance = await prisma.instance.create({
            data: { name: instanceName, status: 'CONNECTING' }
        });

        const result = await whatsappService.createInstance(instanceName);
        res.json({ instance: dbInstance, result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const fetchInstances = async (req: Request, res: Response) => {
    try {
        const instances = await prisma.instance.findMany();
        
        // Atualiza status dinâmico a partir do whatsappService
        const mapped = await Promise.all(instances.map(async (inst) => {
            const memoryStatus = await whatsappService.getStatus(inst.name);
            return {
                ...inst,
                connectionStatus: memoryStatus?.status || 'DISCONNECTED'
            };
        }));

        res.json(mapped);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const connectionState = async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;
        const memoryStatus = await whatsappService.getStatus(instanceName);
        
        if (memoryStatus.status === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Instância não encontrada na memória' });
        }

        res.json({
            instance: {
                instanceName,
                state: memoryStatus.status === 'open' ? 'open' : 'connecting'
            }
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getQrCode = async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;
        const memoryStatus = await whatsappService.getStatus(instanceName);
        
        if (memoryStatus.status === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }

        res.json({
            instanceName,
            base64: memoryStatus.qr // QRCode em base64 recebido da biblioteca Baileys
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteInstance = async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;
        await prisma.instance.deleteMany({ where: { name: instanceName } });
        await whatsappService.deleteInstance(instanceName);
        res.json({ status: 'SUCCESS', message: 'Instância deletada' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
