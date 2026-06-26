import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getContacts = async (req: Request, res: Response) => {
    try {
        let { instanceName } = req.params;
        instanceName = instanceName.trim();

        const dbInstance = await prisma.instance.findUnique({ where: { name: instanceName } });
        if (!dbInstance) {
            return res.status(404).json({ error: 'Instância não encontrada no banco de dados' });
        }

        const contacts = await prisma.contact.findMany({
            where: { instanceId: dbInstance.id },
            include: {
                messages: {
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.json(contacts);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        let { instanceName, remoteJid } = req.params;
        instanceName = instanceName.trim();
        remoteJid = remoteJid.trim();

        const dbInstance = await prisma.instance.findUnique({ where: { name: instanceName } });
        if (!dbInstance) {
            return res.status(404).json({ error: 'Instância não encontrada' });
        }

        const contact = await prisma.contact.findUnique({
            where: { instanceId_remoteJid: { instanceId: dbInstance.id, remoteJid } }
        });

        if (!contact) {
            return res.json([]);
        }

        const messages = await prisma.message.findMany({
            where: { contactId: contact.id },
            orderBy: { timestamp: 'asc' }
        });

        res.json(messages);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
