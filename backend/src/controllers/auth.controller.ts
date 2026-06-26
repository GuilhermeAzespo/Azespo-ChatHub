import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGlobalApiKey = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'O nome da API Key é obrigatório' });

        const apiKey = await prisma.globalApiKey.create({
            data: {
                name,
                key: require('crypto').randomBytes(16).toString('hex').toUpperCase()
            }
        });

        res.json({ message: 'API Key criada', apiKey });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const listGlobalApiKeys = async (req: Request, res: Response) => {
    try {
        const keys = await prisma.globalApiKey.findMany();
        res.json(keys);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteGlobalApiKey = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.globalApiKey.delete({ where: { id } });
        res.json({ status: 'SUCCESS', message: 'API Key removida' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
