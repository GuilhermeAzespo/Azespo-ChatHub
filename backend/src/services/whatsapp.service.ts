import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import * as QRCode from 'qrcode';

class WhatsAppService {
    private sessions: Map<string, any> = new Map();

    async init() {
        console.log('WhatsApp Service Init');
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        try {
            const instances = await prisma.instance.findMany();
            for (const inst of instances) {
                console.log(`[Init] Reconnecting instance: ${inst.name}`);
                await this.connect(inst.name);
            }
        } catch (e) {
            console.error('Error during init reconnections', e);
        }
    }

    async createInstance(instanceName: string) {
        if (this.sessions.has(instanceName)) {
            return { status: 'error', message: 'Instância já existe' };
        }
        return await this.connect(instanceName);
    }

    private async connect(instanceName: string) {
        const sessionPath = path.join(__dirname, '..', '..', '..', 'sessions', instanceName);
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: Browsers.macOS('Desktop'),
            syncFullHistory: false
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(`[${instanceName}] QR Code recebido`);
                try {
                    const base64Qr = await QRCode.toDataURL(qr);
                    this.sessions.set(instanceName, { ...this.sessions.get(instanceName), qr: base64Qr });
                } catch(e) { console.error('Erro ao gerar QR Base64', e); }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    this.connect(instanceName);
                } else {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    this.sessions.delete(instanceName);
                }
            } else if (connection === 'open') {
                console.log(`[${instanceName}] opened connection`);
                const sessionData = this.sessions.get(instanceName) || {};
                sessionData.qr = null;
                sessionData.sock = sock;
                sessionData.status = 'open';
                this.sessions.set(instanceName, sessionData);
            }
        });

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                const { PrismaClient } = await import('@prisma/client');
                const prisma = new PrismaClient();
                const dbInstance = await prisma.instance.findUnique({ where: { name: instanceName } });

                for (const msg of messages) {
                    if (!msg.key.fromMe) {
                        const { webhookService } = await import('./webhook.service');
                        webhookService.dispatch(instanceName, 'messages.upsert', msg);
                    }

                    if (dbInstance) {
                        const remoteJid = msg.key.remoteJid;
                        if (!remoteJid || remoteJid === 'status@broadcast') continue;

                        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || null;
                        if (!text) continue;

                        try {
                            const contact = await prisma.contact.upsert({
                                where: { instanceId_remoteJid: { instanceId: dbInstance.id, remoteJid } },
                                update: { pushName: msg.pushName || undefined },
                                create: { instanceId: dbInstance.id, remoteJid, pushName: msg.pushName }
                            });

                            await prisma.message.upsert({
                                where: { contactId_messageId: { contactId: contact.id, messageId: msg.key.id! } },
                                update: {},
                                create: {
                                    contactId: contact.id,
                                    messageId: msg.key.id!,
                                    fromMe: msg.key.fromMe || false,
                                    text,
                                    timestamp: new Date(Number(msg.messageTimestamp) * 1000)
                                }
                            });
                        } catch (e) {
                            console.error('Error saving message to DB', e);
                        }
                    }
                }
            }
        });

        this.sessions.set(instanceName, { sock, status: 'connecting', qr: null });
        return { status: 'success', message: 'Instância iniciada' };
    }

    async getStatus(instanceName: string) {
        const session = this.sessions.get(instanceName);
        if (!session) return { status: 'NOT_FOUND' };
        return { status: session.status, qr: session.qr };
    }

    async deleteInstance(instanceName: string) {
        const session = this.sessions.get(instanceName);
        if (session && session.sock) {
            session.sock.logout().catch(() => {});
        }
        this.sessions.delete(instanceName);
        const sessionPath = path.join(__dirname, '..', '..', '..', 'sessions', instanceName);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
}

export const whatsappService = new WhatsAppService();
