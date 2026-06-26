import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Send, User, Clock, CheckCircle2 } from 'lucide-react';

export default function ChatPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const api = axios.create({ baseURL: '/api' });

  // Fetch instances on load
  useEffect(() => {
    api.get('/instance/fetchInstances').then(res => {
      const connected = res.data.filter((i: any) => i.connectionStatus === 'open');
      setInstances(connected);
      if (connected.length > 0) {
        setSelectedInstance(connected[0].name);
      }
    }).catch(console.error);
  }, []);

  // Fetch contacts when instance changes
  useEffect(() => {
    if (!selectedInstance) return;
    setLoadingContacts(true);
    
    const fetchContacts = () => {
      api.get(`/chat/contacts/${selectedInstance}`)
        .then(res => setContacts(res.data))
        .catch(console.error)
        .finally(() => setLoadingContacts(false));
    };
    
    fetchContacts();
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, [selectedInstance]);

  // Fetch messages when contact changes
  useEffect(() => {
    if (!selectedInstance || !selectedContact) return;
    
    const fetchMessages = () => {
      api.get(`/chat/messages/${selectedInstance}/${selectedContact.remoteJid}`)
        .then(res => setMessages(res.data))
        .catch(console.error);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedInstance, selectedContact]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedInstance || !selectedContact) return;
    const text = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const tempMsg = {
      id: Date.now().toString(),
      fromMe: true,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.post(`/message/sendText/${selectedInstance}`, {
        number: selectedContact.remoteJid,
        text
      });
      // Will be refreshed by the interval anyway
    } catch (e) {
      alert('Erro ao enviar mensagem');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-card border border-slate-700/50 rounded-2xl overflow-hidden">
      
      {/* Sidebar: Instances and Contacts */}
      <div className="w-full md:w-1/3 border-r border-slate-700/50 flex flex-col bg-dark/30">
        
        {/* Instance Selector */}
        <div className="p-4 border-b border-slate-700/50 bg-card">
          <label className="text-xs text-slate-400 font-medium mb-2 block">Instância Ativa</label>
          <select 
            className="w-full bg-dark border border-slate-700 text-white rounded-lg p-2 outline-none focus:border-primary"
            value={selectedInstance}
            onChange={e => {
              setSelectedInstance(e.target.value);
              setSelectedContact(null);
            }}
          >
            {instances.length === 0 && <option value="">Nenhuma conectada</option>}
            {instances.map(i => (
              <option key={i.name} value={i.name}>{i.name}</option>
            ))}
          </select>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loadingContacts && contacts.length === 0 && (
            <div className="p-4 text-center text-slate-500">Carregando contatos...</div>
          )}
          {contacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-slate-700/30 cursor-pointer transition-colors flex items-center gap-3
                ${selectedContact?.id === contact.id ? 'bg-primary/20 border-l-4 border-l-primary' : 'hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-white font-medium truncate">
                    {contact.pushName || contact.remoteJid.split('@')[0]}
                  </h4>
                  {contact.messages?.[0] && (
                    <span className="text-xs text-slate-500">
                      {new Date(contact.messages[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 truncate">
                  {contact.messages?.[0]?.text || 'Sem mensagens de texto'}
                </p>
              </div>
            </div>
          ))}
          {!loadingContacts && contacts.length === 0 && (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <MessageSquare size={32} className="mb-3 opacity-20" />
              <p>Nenhuma conversa encontrada para esta instância ainda.</p>
              <p className="text-sm mt-2">Envie ou receba mensagens para preencher esta lista.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-[#202c33] flex items-center px-6 border-b border-slate-700/50">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-4">
                <User size={18} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {selectedContact.pushName || selectedContact.remoteJid.split('@')[0]}
                </h3>
                <p className="text-xs text-slate-400">{selectedContact.remoteJid.split('@')[0]}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0b141a] custom-scrollbar">
              {messages.map((msg, idx) => {
                const isMe = msg.fromMe;
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[75%] rounded-xl px-4 py-2 relative group shadow-sm
                        ${isMe ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words pb-4">
                        {msg.text}
                      </p>
                      <div className="absolute bottom-1 right-2 flex items-center gap-1">
                        <span className="text-[10px] text-white/50">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {isMe && <CheckCircle2 size={12} className="text-blue-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#202c33] flex items-center gap-4">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-slate-400 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-slate-500 transition-shadow"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-slate-600"
              >
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-slate-400 mb-2">WhatsApp Inbox</h3>
            <p className="text-sm">Selecione uma conversa ao lado para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
