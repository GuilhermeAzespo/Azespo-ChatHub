import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Key, Copy, Check } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const api = axios.create({ baseURL: 'http://localhost:3000/api' });

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/apikey/list');
      setKeys(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName) return;
    try {
      await api.post('/auth/apikey/create', { name: newKeyName });
      setNewKeyName('');
      fetchKeys();
    } catch (e) {
      alert('Erro ao criar API Key.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Certeza que deseja deletar esta API Key? Ela não poderá mais ser usada.')) return;
    try {
      await api.delete(`/auth/apikey/delete/${id}`);
      fetchKeys();
    } catch (e) {
      alert('Erro ao deletar.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Topbar Actions */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h3 className="text-lg font-semibold text-white">Adicionar API Key</h3>
          <p className="text-sm text-slate-400">Gere tokens de acesso para outros sistemas.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Ex: Azespo Finanças"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="bg-dark border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={!newKeyName}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
            Gerar Token
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div className="bg-card border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-dark text-slate-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Token (Key)</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading && keys.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">Carregando...</td>
              </tr>
            )}
            {keys.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Nenhuma API Key gerada ainda.</td>
              </tr>
            )}
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  <Key size={16} className="text-primary" />
                  {k.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <code className="bg-dark px-3 py-1.5 rounded-lg text-emerald-400 font-mono text-xs">
                      {k.key}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(k.key)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      {copiedKey === k.key ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(k.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-2 hover:bg-rose-400/10 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
