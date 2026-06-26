import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';

class WhatsAppService {
    private sessions: Map<string, any> = new Map();

    async init() {
        // Inicializa instâncias salvas no banco futuramente
        console.log('WhatsApp Service Init');
    }

    async createInstance(instanceName: string) {
        if (this.sessions.has(instanceName)) {
            return { status: 'error', message: 'Instância já existe' };
        }

        return await this.connect(instanceName);
    }

    private async connect(instanceName: string) {
        const sessionPath = path.join(__dirname, '..', '..', 'sessions', instanceName);
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            browser: ['Azespo ChatHub', 'Chrome', '1.0.0'],
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(`[${instanceName}] QR Code recebido`);
                // Armazenar QR para ser lido pela API
                this.sessions.set(instanceName, { ...this.sessions.get(instanceName), qr });
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`[${instanceName}] connection closed due to `, lastDisconnect?.error, ', reconnecting ', shouldReconnect);
                if (shouldReconnect) {
                    this.connect(instanceName);
                } else {
                    // Remover diretório de sessão se deslogado
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    this.sessions.delete(instanceName);
                }
            } else if (connection === 'open') {
                console.log(`[${instanceName}] opened connection`);
                const sessionData = this.sessions.get(instanceName) || {};
                sessionData.qr = null; // limpa qr code
                sessionData.sock = sock;
                sessionData.status = 'open';
                this.sessions.set(instanceName, sessionData);
            }
        });

        this.sessions.set(instanceName, { sock, status: 'connecting', qr: null });
        return { status: 'success', message: 'Instância iniciada' };
    }

    async getStatus(instanceName: string) {
        const session = this.sessions.get(instanceName);
        if (!session) return { status: 'NOT_FOUND' };
        return {
            status: session.status,
            qr: session.qr
        };
    }
}

export const whatsappService = new WhatsAppService();
