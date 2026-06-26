import { Link, Outlet, useLocation } from 'react-router-dom';
import { Smartphone, Key, LayoutDashboard, Settings } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  const menu = [
    { name: 'Instâncias', path: '/instances', icon: <Smartphone size={20} /> },
    { name: 'API Keys', path: '/apikeys', icon: <Key size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-slate-700/50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">ChatHub</h1>
            <p className="text-xs text-slate-400">By Azespo</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors">
            <Settings size={20} />
            Configurações
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 flex items-center px-8 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">
            {menu.find((m) => location.pathname.startsWith(m.path))?.name || 'Dashboard'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
