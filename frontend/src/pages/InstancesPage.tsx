import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, QrCode, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function InstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [qrModal, setQrModal] = useState<{ open: boolean; base64: string | null; instance: string }>({
    open: false, base64: null, instance: ''
  });

  const api = axios.create({ baseURL: '/api' });

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/instance/fetchInstances');
      setInstances(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!newInstanceName) return;
    setIsCreating(true);
    try {
      await api.post('/instance/create', { instanceName: newInstanceName });
      setNewInstanceName('');
      fetchInstances();
    } catch (e) {
      alert('Erro ao criar instância. Já existe?');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Certeza que deseja deletar a instância ${name}?`)) return;
    try {
      await api.delete(`/instance/delete/${name}`);
      fetchInstances();
    } catch (e) {
      alert('Erro ao deletar.');
    }
  };

  const handleShowQr = async (name: string) => {
    setQrModal({ open: true, base64: null, instance: name });
    try {
      const res = await api.get(`/instance/connect/${name}`);
      setQrModal({ open: true, base64: res.data.base64, instance: name });
    } catch (e) {
      alert('QR Code indisponível.');
      setQrModal({ open: false, base64: null, instance: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Topbar Actions */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h3 className="text-lg font-semibold text-white">Adicionar Conexão</h3>
          <p className="text-sm text-slate-400">Crie uma nova sessão do WhatsApp.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Nome da Instância"
            value={newInstanceName}
            onChange={(e) => setNewInstanceName(e.target.value)}
            className="bg-dark border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={isCreating || !newInstanceName}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isCreating ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} />}
            Criar Instância
          </button>
        </div>
      </div>

      {/* Instance List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && instances.length === 0 && <p className="text-slate-400 col-span-full">Carregando...</p>}
        {instances.map((inst) => (
          <div key={inst.id} className="bg-card border border-slate-700/50 rounded-2xl p-6 flex flex-col hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white">{inst.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  {inst.connectionStatus === 'open' ? (
                    <span className="flex items-center gap-1 text-sm text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                      <CheckCircle2 size={14} /> Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-rose-400 bg-rose-400/10 px-2 py-1 rounded-md">
                      <XCircle size={14} /> Desconectado
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(inst.name)}
                className="text-slate-400 hover:text-rose-400 transition-colors p-2 hover:bg-rose-400/10 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-auto pt-6 flex items-center gap-3 border-t border-slate-700/50">
              <button
                onClick={() => handleShowQr(inst.name)}
                disabled={inst.connectionStatus === 'open'}
                className="flex-1 bg-dark hover:bg-slate-800 text-white border border-slate-700 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <QrCode size={18} />
                QR Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {qrModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-slate-700 rounded-2xl p-8 max-w-sm w-full relative">
            <button 
              onClick={() => setQrModal({ open: false, base64: null, instance: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 text-center">Escanear QR Code</h3>
            <div className="bg-white p-4 rounded-xl flex items-center justify-center min-h-[250px]">
              {qrModal.base64 ? (
                <img src={qrModal.base64} alt="QR Code" className="w-full h-auto" />
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <RefreshCw className="animate-spin mb-2" size={24} />
                  <p>Gerando QR Code...</p>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-slate-400 mt-4">
              Abra o WhatsApp no seu celular e escaneie o código acima.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
